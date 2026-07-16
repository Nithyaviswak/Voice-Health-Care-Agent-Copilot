"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";

interface EmergencyContextType {
  isEmergency: boolean;
  triggerEmergency: () => void;
  cancelEmergency: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(
  undefined
);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [isEmergency, setIsEmergency] = useState(false);

  const triggerEmergency = useCallback(() => setIsEmergency(true), []);
  const cancelEmergency = useCallback(() => setIsEmergency(false), []);

  return (
    <EmergencyContext.Provider
      value={{ isEmergency, triggerEmergency, cancelEmergency }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
}
