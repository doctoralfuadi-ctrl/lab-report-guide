"""
MidScope Core Engine — Backend
================================
ADR-001: AIGateway Abstraction Layer
ADR-002: Medical Guardrails Integration
ADR-003: Provider Adapter Pattern
"""

from .ai_gateway import AIGateway, AIRequest, AIResponse
from .gemini_adapter import GeminiAdapter
from .medical_guardrails import MedicalGuardrails, GuardrailResult
from .health_module import HealthModule

__all__ = [
    "AIGateway",
    "AIRequest",
    "AIResponse",
    "GeminiAdapter",
    "MedicalGuardrails",
    "GuardrailResult",
    "HealthModule",
]
