# ADR-001: AI Gateway Abstraction Layer

## Status: Accepted
## Date: 2025-06-28

## Context
MidScope directly called the Emergent LLM SDK throughout server.py, creating tight coupling 
to a single provider and making it impossible to add medical guardrails consistently.

## Decision
Introduce an AIGateway class as the single entry point for all AI interactions:
- Provider-agnostic request/response model (AIRequest, AIResponse)
- Adapter pattern for providers (GeminiAdapter implements AIProviderAdapter)
- Automatic retry with exponential backoff
- Pre/post processing hooks for medical guardrails
- Audit logging for all AI interactions

## Consequences
- All AI calls route through `core.engine.get_engine().process(request)`
- New providers added by implementing AIProviderAdapter
- Medical guardrails applied consistently to all requests
- Token usage tracked centrally

## File Map
- `backend/core/ai_gateway.py` - Gateway + abstractions
- `backend/core/gemini_adapter.py` - Emergent/Gemini implementation
- `backend/core/engine.py` - Factory function
