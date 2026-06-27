# ADR-002: Medical Guardrails Integration

## Status: Accepted
## Date: 2025-06-28

## Context
TSH unit validation, age/sex reference ranges, and critical value detection 
were scattered across server.py without consistent enforcement.

## Decision
Create a MedicalGuardrails class that integrates with the AIGateway as pre/post processor:
- TSH unit validation (mIU/L vs uIU/mL equivalence check)
- Age/sex-stratified TSH ranges (neonate through elderly, including pregnancy trimesters)
- Critical value detection for glucose, potassium, sodium, calcium, hemoglobin, etc.
- Patient disclaimer auto-injection
- Integration with HealthModule for patient context

## Consequences
- Every lab analysis passes through guardrail checks before and after AI generation
- Critical values cannot be missed in AI output
- TSH units are validated against known standards
- Patient-facing output always includes medical disclaimer

## File Map
- `backend/core/medical_guardrails.py` - Guardrail engine
- `backend/core/health_module.py` - Patient context bridge
