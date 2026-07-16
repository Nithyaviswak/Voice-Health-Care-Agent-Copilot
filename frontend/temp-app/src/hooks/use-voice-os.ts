"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface UseVoiceOSOptions {
  conversationId?: string;
  onEmergency?: (message: string) => void;
}

interface VoiceMessage {
  type: string;
  text?: string;
  audio?: string;
  conversation_id?: string;
  state?: string;
  done?: boolean;
  message?: string;
  flags?: Array<{ type: string; keyword: string; severity: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useVoiceOS({ conversationId, onEmergency }: UseVoiceOSOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const responseBufferRef = useRef("");
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const tokenRef = useRef<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }, []);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }
    tokenRef.current = token;

    const ws = new WebSocket(`${WS_URL}/api/v1/voice/ws?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      ws.send(JSON.stringify({ type: "start_conversation", title: "Voice Session" }));
    };

    ws.onmessage = (event) => {
      const msg: VoiceMessage = JSON.parse(event.data);
      handleMessage(msg);
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      reconnectTimeoutRef.current = setTimeout(() => {
        if (tokenRef.current) connect();
      }, 3000);
    };

    ws.onerror = () => {
      setError("WebSocket connection failed");
    };

    wsRef.current = ws;
  }, [getToken]);

  const handleMessage = useCallback((msg: VoiceMessage) => {
    switch (msg.type) {
      case "state":
        setState(msg.state as VoiceState);
        break;

      case "transcript":
        if (msg.text) setTranscript(msg.text);
        break;

      case "llm_chunk":
        if (msg.done) {
          setIsStreaming(false);
          setTimeout(() => setState("idle"), 1500);
        } else if (msg.text) {
          responseBufferRef.current += msg.text;
          setResponse(responseBufferRef.current);
        }
        break;

      case "tts_audio":
        if (msg.audio) playAudioBase64(msg.audio);
        break;

      case "emergency":
        onEmergency?.(msg.message || "Emergency detected");
        break;

      case "error":
        setError(msg.message || "Unknown error");
        break;

      case "conversation_started":
        break;
    }
  }, [onEmergency]);

  const playAudioBase64 = (b64: string) => {
    try {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play().catch(() => {});
    } catch {}
  };

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const b64 = await blobToBase64(blob);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "audio", audio: b64 }));
        }
      };

      recorder.start(1000);
    } catch {
      setError("Microphone access denied");
    }
  }, []);

  const stopMic = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    setTranscript("");
    setResponse("");
    responseBufferRef.current = "";
    setError(null);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
      await new Promise((r) => setTimeout(r, 500));
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setState("listening");
      await startMic();
    }
  }, [connect, startMic]);

  const stop = useCallback(() => {
    stopMic();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
    }
    setState("idle");
    setIsStreaming(false);
  }, [stopMic]);

  const sendText = useCallback((text: string) => {
    setTranscript(text);
    setResponse("");
    responseBufferRef.current = "";
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "text", text }));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMic();
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [stopMic]);

  return {
    state,
    transcript,
    response,
    isStreaming,
    isConnected,
    error,
    start,
    stop,
    sendText,
    connect,
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
