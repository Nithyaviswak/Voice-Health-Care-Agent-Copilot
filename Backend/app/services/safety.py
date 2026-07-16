import re

EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "stroke", "severe bleeding", "unconscious",
    "can't breathe", "difficulty breathing", "overdose", "seizure", "anaphylaxis",
]

SELF_HARM_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self harm", "hurt myself",
    "want to die", "no reason to live",
]

DOSAGE_KEYWORDS = [
    r"take \d+ mg",
    r"dose of \d+",
    r"how much .* medication",
    r"increase .* dose",
    r"double .* dose",
]

UNSAFE_PATTERNS = [
    r"you should take \d+ mg",
    r"increas(?:e|ing) your dose",
    r"stop taking your medication",
    r"ignore your doctor",
]


class SafetyEngine:
    def check(self, text: str) -> dict:
        text_lower = text.lower().strip()
        flags = []

        for keyword in EMERGENCY_KEYWORDS:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                flags.append({"type": "emergency", "keyword": keyword, "severity": "critical"})
                break

        for keyword in SELF_HARM_KEYWORDS:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                flags.append({"type": "self_harm", "keyword": keyword, "severity": "critical"})
                break

        for pattern in DOSAGE_KEYWORDS:
            if re.search(pattern, text_lower):
                flags.append({"type": "dosage_query", "keyword": pattern, "severity": "warning"})
                break

        for pattern in UNSAFE_PATTERNS:
            if re.search(pattern, text_lower):
                flags.append({"type": "unsafe_advice", "keyword": pattern, "severity": "warning"})
                break

        is_emergency = any(f["severity"] == "critical" for f in flags)
        is_unsafe = len(flags) > 0

        return {
            "is_safe": not is_unsafe,
            "is_emergency": is_emergency,
            "flags": flags,
            "override_response": self._get_override(flags),
        }

    def filter_output(self, text: str) -> str:
        for pattern in UNSAFE_PATTERNS:
            text = re.sub(pattern, "[redacted - consult your doctor]", text, flags=re.IGNORECASE)
        return text

    def _get_override(self, flags: list[dict]) -> str:
        if not flags:
            return ""
        types = [f["type"] for f in flags]
        if "emergency" in types:
            return "If you are experiencing a medical emergency, please call 911 or your local emergency number immediately. This AI cannot provide emergency care."
        if "self_harm" in types:
            return "If you are in crisis, please reach out to the 988 Suicide & Crisis Lifeline by calling or texting 988. You are not alone."
        if "dosage_query" in types:
            return "I cannot recommend medication dosages. Please consult your prescribing physician or pharmacist."
        return "I want to make sure I give you safe information. Please consult a healthcare professional for personalized medical advice."


safety_engine = SafetyEngine()
