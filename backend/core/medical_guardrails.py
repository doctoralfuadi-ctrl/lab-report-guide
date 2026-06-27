"""
MidScope Core Engine — Medical Guardrails (ADR-002)
====================================================
Pre/post processing layer ensuring medical safety and accuracy.
"""

from __future__ import annotations
import re
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from .ai_gateway import AIRequest, AIResponse, AnalysisMode

logger = logging.getLogger(__name__)


@dataclass
class GuardrailResult:
    passed: bool
    rule_name: str
    severity: str = "info"
    message: str = ""
    correction_applied: bool = False
    original_value: Optional[str] = None
    corrected_value: Optional[str] = None


TSH_RANGES = {
    "neonate": (1.0, 39.0),
    "infant": (0.7, 6.0),
    "child": (0.6, 5.5),
    "adolescent": (0.5, 4.5),
    "adult_male": (0.4, 4.0),
    "adult_female": (0.4, 4.5),
    "adult_female_pregnant_t1": (0.1, 2.5),
    "adult_female_pregnant_t2": (0.2, 3.0),
    "adult_female_pregnant_t3": (0.3, 3.5),
    "elderly": (0.4, 7.0),
}

CRITICAL_VALUES = {
    "glucose": {"low": 40, "high": 500, "unit": "mg/dl"},
    "potassium": {"low": 2.5, "high": 6.5, "unit": "mmol/l"},
    "sodium": {"low": 120, "high": 160, "unit": "mmol/l"},
    "calcium": {"low": 6.0, "high": 13.0, "unit": "mg/dl"},
    "hemoglobin": {"low": 5.0, "high": 20.0, "unit": "g/dl"},
    "platelets": {"low": 20, "high": 1000, "unit": "x10^3/ul"},
    "wbc": {"low": 1.0, "high": 50.0, "unit": "x10^3/ul"},
    "inr": {"low": None, "high": 5.0, "unit": "ratio"},
    "troponin_i": {"low": None, "high": 0.04, "unit": "ng/ml"},
}


class MedicalGuardrails:
    def __init__(self, reference_engine=None, health_module=None):
        self._reference_engine = reference_engine
        self._health_module = health_module
        self._check_log: List[GuardrailResult] = []

    async def pre_process(self, request: AIRequest) -> AIRequest:
        if request.mode != AnalysisMode.LAB_REPORT:
            return request
        context = request.context
        enrichment_lines = []
        age = context.get("age_years")
        sex = context.get("sex", "any")
        pregnancy_status = context.get("pregnancy_status")
        pregnancy_week = context.get("pregnancy_week")
        lab_entries = context.get("lab_entries", [])
        for entry in lab_entries:
            name_lower = (entry.get("name") or "").lower()
            if "tsh" in name_lower:
                unit = (entry.get("unit") or "").lower().strip()
                value = entry.get("value")
                valid_tsh_units = ["miu/l", "\u00b5iu/ml", "uiu/ml", "miu/ml", "mlu/l"]
                if unit and not any(u in unit for u in valid_tsh_units):
                    result = GuardrailResult(passed=False, rule_name="TSH_UNIT_VALIDATION", severity="warning", message=f"Non-standard TSH unit detected: '{unit}'. Expected mIU/L or \u00b5IU/mL.")
                    self._check_log.append(result)
                    enrichment_lines.append(f"\u26a0\ufe0f GUARDRAIL: TSH unit '{unit}' may be non-standard. Standard: mIU/L (= \u00b5IU/mL). Verify before interpreting.")
                if age is not None and value is not None:
                    range_key = self._get_tsh_range_key(age, sex, pregnancy_status, pregnancy_week)
                    ref_range = TSH_RANGES.get(range_key, TSH_RANGES["adult_male"])
                    enrichment_lines.append(f"TSH Reference ({range_key}): {ref_range[0]}-{ref_range[1]} mIU/L")
        for entry in lab_entries:
            alerts = self._check_critical(entry)
            for alert in alerts:
                self._check_log.append(alert)
                if alert.severity == "critical":
                    enrichment_lines.append(f"\ud83d\udea8 CRITICAL VALUE: {alert.message}")
        if enrichment_lines:
            guardrail_block = "\n[MEDICAL GUARDRAILS \u2014 AUTO-INJECTED]\n" + "\n".join(enrichment_lines) + "\n"
            request.prompt = guardrail_block + request.prompt
            request.metadata["guardrails_injected"] = True
        return request

    async def post_process(self, request: AIRequest, response: AIResponse) -> AIResponse:
        if request.mode != AnalysisMode.LAB_REPORT:
            return response
        notes = []
        critical_entries = [r for r in self._check_log if r.severity == "critical"]
        for crit in critical_entries:
            test_name = crit.rule_name.replace("CRITICAL_", "").lower()
            if test_name not in response.content.lower():
                notes.append(f"Critical value for {test_name} may not be adequately addressed in response")
        if request.audience == "patient":
            disclaimer_ar = "\n\n\u2695\ufe0f \u062a\u0646\u0628\u064a\u0647: \u0647\u0630\u0627 \u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0644\u0644\u0627\u0633\u062a\u0631\u0634\u0627\u062f \u0641\u0642\u0637 \u0648\u0644\u0627 \u064a\u063a\u0646\u064a \u0639\u0646 \u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064a\u0628 \u0627\u0644\u0645\u062e\u062a\u0635."
            disclaimer_en = "\n\n\u2695\ufe0f Note: This analysis is for informational purposes only and does not replace professional medical consultation."
            if request.language == "ar":
                response.content += disclaimer_ar
            else:
                response.content += disclaimer_en
            notes.append("Patient disclaimer appended")
        if notes:
            response.guardrail_applied = True
            response.guardrail_notes = notes
        return response

    def _get_tsh_range_key(self, age: float, sex: str, pregnancy_status: Optional[str], pregnancy_week: Optional[int]) -> str:
        if age <= 28 / 365:
            return "neonate"
        if age <= 1:
            return "infant"
        if age <= 12:
            return "child"
        if age <= 17:
            return "adolescent"
        if age >= 65:
            return "elderly"
        if sex == "female" and pregnancy_status == "pregnant":
            if pregnancy_week and pregnancy_week <= 12:
                return "adult_female_pregnant_t1"
            elif pregnancy_week and pregnancy_week <= 27:
                return "adult_female_pregnant_t2"
            elif pregnancy_week:
                return "adult_female_pregnant_t3"
            return "adult_female_pregnant_t1"
        if sex == "female":
            return "adult_female"
        return "adult_male"

    def _check_critical(self, entry: Dict[str, Any]) -> List[GuardrailResult]:
        results = []
        name = (entry.get("name") or "").lower().strip()
        value = entry.get("value")
        if value is None:
            return results
        try:
            val = float(value)
        except (TypeError, ValueError):
            return results
        for test_key, thresholds in CRITICAL_VALUES.items():
            if test_key in name or name in test_key:
                if thresholds["low"] is not None and val < thresholds["low"]:
                    results.append(GuardrailResult(passed=False, rule_name=f"CRITICAL_{test_key.upper()}_LOW", severity="critical", message=f"{name} = {val} {entry.get('unit', '')} is critically LOW (threshold: {thresholds['low']} {thresholds['unit']})"))
                if thresholds["high"] is not None and val > thresholds["high"]:
                    results.append(GuardrailResult(passed=False, rule_name=f"CRITICAL_{test_key.upper()}_HIGH", severity="critical", message=f"{name} = {val} {entry.get('unit', '')} is critically HIGH (threshold: {thresholds['high']} {thresholds['unit']})"))
                break
        return results

    @property
    def check_history(self) -> List[GuardrailResult]:
        return self._check_log.copy()

    def clear_history(self) -> None:
        self._check_log.clear()
