"""
MidScope Core Engine — Health Module (ADR-002)
===============================================
Central integration point between the Health Profile (3-layer architecture)
and the Lab Reference Range Engine.
"""

from __future__ import annotations
import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


class HealthModule:
    def __init__(self, reference_db=None):
        self._reference_db = reference_db

    @staticmethod
    def compute_age(date_of_birth: Optional[str], reference_date: Optional[date] = None) -> Optional[float]:
        if not date_of_birth:
            return None
        try:
            dob = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None
        ref = reference_date or date.today()
        delta = ref - dob
        return delta.days / 365.25

    @staticmethod
    def age_group(age_years: Optional[float]) -> str:
        if age_years is None:
            return "adult"
        if age_years <= 28 / 365.25:
            return "neonate"
        if age_years <= 1.0:
            return "infant"
        if age_years <= 12.0:
            return "child"
        if age_years <= 17.0:
            return "adolescent"
        if age_years <= 64.0:
            return "adult"
        return "elderly"

    def derive_context(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        layer1 = profile.get("layer1", {})
        layer2 = profile.get("layer2", {})
        layer3 = profile.get("layer3", {})
        age_years = self.compute_age(layer1.get("date_of_birth"))
        return {
            "age_years": age_years,
            "age_group": self.age_group(age_years),
            "sex": layer1.get("sex", "any"),
            "height_cm": layer1.get("height_cm"),
            "weight_kg": layer2.get("weight_kg"),
            "blood_group": layer1.get("blood_group"),
            "allergies": layer1.get("allergies", []),
            "chronic_diseases": layer1.get("chronic_diseases", []),
            "medications": layer2.get("long_term_medications", []) + layer3.get("recent_medications", []),
            "smoking_status": layer2.get("smoking_status"),
            "pregnancy_status": layer3.get("pregnancy_status"),
            "pregnancy_week": layer3.get("pregnancy_week"),
            "lactation": layer3.get("lactation"),
            "fasting_status": layer3.get("fasting_status"),
            "current_symptoms": layer3.get("current_symptoms", []),
            "reason_for_test": layer3.get("reason_for_test"),
        }

    def normalise_lab_entries(self, entries: List[Dict[str, Any]], age_years: Optional[float] = None, sex: str = "any") -> List[Dict[str, Any]]:
        if self._reference_db is None:
            logger.warning("No reference DB attached to HealthModule; returning entries unchanged")
            return entries
        try:
            return self._reference_db.normalise_lab_entries(entries, age=age_years, sex=sex)
        except Exception as e:
            logger.error(f"Lab normalisation failed: {e}")
            return entries

    def render_for_prompt(self, profile: Dict[str, Any], lab_entries: Optional[List[Dict[str, Any]]] = None) -> str:
        context = self.derive_context(profile)
        lines = ["[PATIENT CONTEXT]"]
        if context["age_years"] is not None:
            lines.append(f"Age: {context['age_years']:.1f} years ({context['age_group']})")
        if context["sex"] != "any":
            lines.append(f"Sex: {context['sex']}")
        if context["pregnancy_status"] == "pregnant":
            week_str = f" (week {context['pregnancy_week']})" if context["pregnancy_week"] else ""
            lines.append(f"Pregnancy: Yes{week_str}")
        if context["chronic_diseases"]:
            lines.append(f"Chronic: {', '.join(context['chronic_diseases'])}")
        if context["medications"]:
            lines.append(f"Medications: {', '.join(context['medications'])}")
        if context["current_symptoms"]:
            lines.append(f"Current symptoms: {', '.join(context['current_symptoms'])}")
        if context["fasting_status"]:
            lines.append(f"Fasting: {context['fasting_status']}")
        if lab_entries:
            normalised = self.normalise_lab_entries(lab_entries, age_years=context["age_years"], sex=context["sex"])
            lines.append("\n[LAB RESULTS \u2014 NORMALISED]")
            for entry in normalised:
                name = entry.get("name", "?")
                value = entry.get("value", "?")
                unit = entry.get("unit", "")
                status = entry.get("status", "")
                ref_range = entry.get("ref_range_str", "")
                lines.append(f"  {name}: {value} {unit} [{status}] (Ref: {ref_range})")
        return "\n".join(lines)
