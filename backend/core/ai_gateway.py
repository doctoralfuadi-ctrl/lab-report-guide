"""
MidScope Core Engine — AIGateway Abstraction (ADR-001)
=======================================================
Single entry point for all AI provider interactions.
Implements provider-agnostic request/response model with:
  - Provider routing
  - Medical guardrail pre/post processing
  - Retry logic with exponential backoff
  - Token budget management
  - Audit logging
"""

from __future__ import annotations
import asyncio
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Protocol

logger = logging.getLogger(__name__)


class ProviderType(str, Enum):
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    EMERGENT = "emergent"


class AnalysisMode(str, Enum):
    LAB_REPORT = "lab_report"
    RADIOLOGY = "radiology"
    ECG = "ecg"
    RECOMMENDATION = "recommendation"
    GENERAL = "general"


@dataclass
class AIRequest:
    """Provider-agnostic AI request."""
    prompt: str
    mode: AnalysisMode = AnalysisMode.GENERAL
    language: str = "ar"
    audience: str = "patient"
    attachments: List[Dict[str, Any]] = field(default_factory=list)
    context: Dict[str, Any] = field(default_factory=dict)
    max_tokens: int = 8192
    temperature: float = 0.3
    provider_override: Optional[ProviderType] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AIResponse:
    """Provider-agnostic AI response."""
    content: str
    provider_used: ProviderType
    model_id: str
    tokens_used: int = 0
    latency_ms: float = 0.0
    guardrail_applied: bool = False
    guardrail_notes: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    raw_response: Optional[Any] = None


class AIProviderAdapter(ABC):
    """Abstract base class for AI provider adapters."""

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType:
        ...

    @property
    @abstractmethod
    def model_id(self) -> str:
        ...

    @abstractmethod
    async def generate(self, request: AIRequest) -> AIResponse:
        ...

    @abstractmethod
    async def generate_with_files(self, request: AIRequest) -> AIResponse:
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        ...


class AIGateway:
    """
    Central AI Gateway — routes requests to registered provider adapters.
    """

    def __init__(self, default_provider: ProviderType = ProviderType.EMERGENT, max_retries: int = 3, retry_base_delay: float = 1.0):
        self._adapters: Dict[ProviderType, AIProviderAdapter] = {}
        self._default_provider = default_provider
        self._max_retries = max_retries
        self._retry_base_delay = retry_base_delay
        self._guardrails = None
        self._request_log: List[Dict[str, Any]] = []

    def register_adapter(self, adapter: AIProviderAdapter) -> None:
        self._adapters[adapter.provider_type] = adapter
        logger.info(f"Registered AI adapter: {adapter.provider_type.value} ({adapter.model_id})")

    def set_guardrails(self, guardrails) -> None:
        self._guardrails = guardrails
        logger.info("Medical guardrails attached to AI Gateway")

    def _select_adapter(self, request: AIRequest) -> AIProviderAdapter:
        provider = request.provider_override or self._default_provider
        if provider in self._adapters:
            return self._adapters[provider]
        if self._adapters:
            fallback = next(iter(self._adapters.values()))
            logger.warning(f"Provider {provider.value} not available, falling back to {fallback.provider_type.value}")
            return fallback
        raise RuntimeError("No AI provider adapters registered")

    async def process(self, request: AIRequest) -> AIResponse:
        start_time = time.time()
        if self._guardrails:
            request = await self._guardrails.pre_process(request)
        adapter = self._select_adapter(request)
        last_error = None
        for attempt in range(self._max_retries):
            try:
                if request.attachments:
                    response = await adapter.generate_with_files(request)
                else:
                    response = await adapter.generate(request)
                response.latency_ms = (time.time() - start_time) * 1000
                if self._guardrails:
                    response = await self._guardrails.post_process(request, response)
                self._log_request(request, response, attempt + 1)
                return response
            except Exception as e:
                last_error = e
                logger.warning(f"AI Gateway attempt {attempt + 1}/{self._max_retries} failed: {e}")
                if attempt < self._max_retries - 1:
                    delay = self._retry_base_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
        raise RuntimeError(f"AI Gateway: all {self._max_retries} attempts failed. Last error: {last_error}")

    def _log_request(self, request: AIRequest, response: AIResponse, attempts: int) -> None:
        entry = {"timestamp": time.time(), "mode": request.mode.value, "provider": response.provider_used.value, "model": response.model_id, "tokens": response.tokens_used, "latency_ms": response.latency_ms, "attempts": attempts, "guardrail_applied": response.guardrail_applied, "language": request.language, "audience": request.audience}
        self._request_log.append(entry)
        if len(self._request_log) > 1000:
            self._request_log = self._request_log[-500:]

    @property
    def stats(self) -> Dict[str, Any]:
        if not self._request_log:
            return {"total_requests": 0}
        total = len(self._request_log)
        avg_latency = sum(e["latency_ms"] for e in self._request_log) / total
        total_tokens = sum(e["tokens"] for e in self._request_log)
        return {"total_requests": total, "avg_latency_ms": round(avg_latency, 2), "total_tokens": total_tokens, "providers_used": list(set(e["provider"] for e in self._request_log))}
