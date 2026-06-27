"""
MidScope Core Engine — Configuration (ADR-004)
================================================
Centralised configuration for the Core Engine.
All config is read from environment variables with sensible defaults.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class CoreConfig:
    """Core Engine configuration."""
    emergent_llm_key: str = field(default_factory=lambda: os.environ.get("EMERGENT_LLM_KEY", ""))
    llm_model: str = field(default_factory=lambda: os.environ.get("LLM_MODEL", "gemini-2.5-flash"))
    llm_base_url: str = field(default_factory=lambda: os.environ.get("LLM_BASE_URL", "https://integrations.emergentagent.com/llm"))
    max_retries: int = 3
    retry_base_delay: float = 1.0
    default_max_tokens: int = 8192
    default_temperature: float = 0.3
    mongo_url: str = field(default_factory=lambda: os.environ.get("MONGO_URL", ""))
    db_name: str = field(default_factory=lambda: os.environ.get("DB_NAME", "midscope"))
    stripe_secret_key: str = field(default_factory=lambda: os.environ.get("STRIPE_SECRET_KEY", ""))
    stripe_webhook_secret: str = field(default_factory=lambda: os.environ.get("STRIPE_WEBHOOK_SECRET", ""))
    price_standard_yearly: int = 10
    price_premium_yearly: int = 25
    price_clinic_yearly: int = 100
    radiology_module_enabled: bool = False
    ecg_module_enabled: bool = False

    @classmethod
    def from_env(cls) -> "CoreConfig":
        return cls()

config = CoreConfig.from_env()
