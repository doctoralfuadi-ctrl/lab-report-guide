"""
MidScope — Smart Health Profile (3-Layer Architecture)

LAYER 1 — Permanent (stored once, rarely changes):
    name, date_of_birth, sex, height_cm, blood_group, allergies,
    chronic_diseases, surgical_history, family_history

LAYER 2 — Semi-permanent (updated periodically):
    weight_kg, smoking_status, exercise_habits, baseline_bp_systolic,
    baseline_bp_diastolic, long_term_medications, supplements

LAYER 3 — Dynamic clinical context (re-collected per submission):
    pregnancy_status, pregnancy_week, lactation, acute_infection_or_fever,
    recent_medications, recent_surgeries, fasting_status, reason_for_test,
    current_symptoms

Age is COMPUTED at runtime from `date_of_birth` so it stays accurate without
storing a stale value. The computed age + sex feeds the age/sex-stratified
Reference Range Engine in lab_reference_db.py.
"""

from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ---------- Layer 1 ----------
class HealthProfileLayer1(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None   # ISO YYYY-MM-DD
    sex: Optional[str] = None             # "male" | "female" | "other"
    height_cm: Optional[float] = None
    blood_group: Optional[str] = None     # e.g. "A+", "O-"
    allergies: List[str] = Field(default_factory=list)
    chronic_diseases: List[str] = Field(default_factory=list)
    surgical_history: List[str] = Field(default_factory=list)
    family_history: List[str] = Field(default_factory=list)


# ---------- Layer 2 ----------
class HealthProfileLayer2(BaseModel):
    weight_kg: Optional[float] = None
    smoking_status: Optional[str] = None  # "never" | "former" | "current" | "n_per_day:<n>"
    exercise_habits: Optional[str] = None # "sedentary" | "light" | "moderate" | "vigorous"
    baseline_bp_systolic: Optional[int] = None
    baseline_bp_diastolic: Optional[int] = None
    long_term_medications: List[str] = Field(default_factory=list)
    supplements: List[str] = Field(default_factory=list)


# ---------- Layer 3 ----------
class HealthProfileLayer3(BaseModel):
    pregnancy_status: Optional[str] = None       # "not_pregnant" | "pregnant" | "unknown"
    pregnancy_week: Optional[int] = None
    lactation: Optional[bool] = None
    acute_infection_or_fever: Optional[bool] = None
    recent_medications: List[str] = Field(default_factory=list)   # last 30 days
    recent_surgeries: List[str] = Field(default_factory=list)     # last 90 days
    fasting_status: Optional[str] = None         # "fasting_8h" | "fasting_12h" | "non_fasting" | "unknown"
    reason_for_test: Optional[str] = None
    current_symptoms: List[str] = Field(default_factory=list)


class SmartHealthProfile(BaseModel):
    layer1: HealthProfileLayer1 = Field(default_factory=HealthProfileLayer1)
    layer2: HealthProfileLayer2 = Field(default_factory=HealthProfileLayer2)
    layer3: HealthProfileLayer3 = Field(default_factory=HealthProfileLayer3)


# ---------- Helpers ----------
def calculate_age_years(dob_str: Optional[str], reference_date: Optional[date] = None) -> Optional[float]:
    """Calculate age in years (with fractional months for <1y) from ISO YYYY-MM-DD.
    Runs every request so the value is always current."""
    if not dob_str:
        return None
    try:
        dob = datetime.fromisoformat(dob_str.strip()).date()
    except (ValueError, TypeError):
        try:
            dob = datetime.strptime(dob_str.strip(), "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None
    today = reference_date or date.today()
    if dob > today:
        return None
    age_years = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    if age_years == 0:
        # Sub-1y: return fractional years
        delta_days = (today - dob).days
        return round(delta_days / 365.25, 3)
    return float(age_years)


def derive_patient_context(profile: SmartHealthProfile) -> dict:
    """Produce the {age, sex, pregnant} dict consumed by the lab reference engine."""
    age = calculate_age_years(profile.layer1.date_of_birth)
    pregnant = (profile.layer3.pregnancy_status or "").lower() == "pregnant"
    return {
        "age": age,
        "age_unit": "years",
        "sex": profile.layer1.sex,
        "pregnant": pregnant,
        "pregnancy_week": profile.layer3.pregnancy_week,
    }


def render_profile_for_prompt(profile: SmartHealthProfile, language: str = "en") -> str:
    """Format the 3-layer profile as a Clinical Metadata block for the AI system prompt."""
    age = calculate_age_years(profile.layer1.date_of_birth)
    L1, L2, L3 = profile.layer1, profile.layer2, profile.layer3

    def _join(items, fallback="\u2014"):
        return ", ".join(items) if items else fallback

    if language == "ar":
        block = [
            "\ud83d\udccb \u0627\u0644\u0633\u064a\u0627\u0642 \u0627\u0644\u0633\u0631\u064a\u0631\u064a \u0644\u0644\u0645\u0631\u064a\u0636 (\u064a\u062c\u0628 \u0623\u062e\u0630\u0647 \u0628\u0627\u0644\u062d\u0633\u0628\u0627\u0646 \u0641\u064a \u0627\u0644\u062a\u0641\u0633\u064a\u0631):",
            "\u2014 \u0627\u0644\u0637\u0628\u0642\u0629 1 (\u062f\u0627\u0626\u0645\u0629) \u2014",
            f"  \u2022 \u0627\u0644\u0627\u0633\u0645: {L1.name or '\u2014'}",
            f"  \u2022 \u0627\u0644\u0639\u0645\u0631: {age if age is not None else '\u063a\u064a\u0631 \u0645\u062d\u062f\u062f'} \u0633\u0646\u0629 \u00b7 \u0627\u0644\u062c\u0646\u0633: {L1.sex or '\u2014'}",
            f"  \u2022 \u0627\u0644\u0637\u0648\u0644: {L1.height_cm or '\u2014'} \u0633\u0645 \u00b7 \u0641\u0635\u064a\u0644\u0629 \u0627\u0644\u062f\u0645: {L1.blood_group or '\u2014'}",
            f"  \u2022 \u0623\u0645\u0631\u0627\u0636 \u0645\u0632\u0645\u0646\u0629: {_join(L1.chronic_diseases)}",
            f"  \u2022 \u062d\u0633\u0627\u0633\u064a\u0629 \u062f\u0648\u0627\u0626\u064a\u0629: {_join(L1.allergies)}",
            f"  \u2022 \u062a\u0627\u0631\u064a\u062e \u062c\u0631\u0627\u062d\u064a: {_join(L1.surgical_history)}",
            f"  \u2022 \u062a\u0627\u0631\u064a\u062e \u0639\u0627\u0626\u0644\u064a: {_join(L1.family_history)}",
            "\u2014 \u0627\u0644\u0637\u0628\u0642\u0629 2 (\u0634\u0628\u0647 \u062f\u0627\u0626\u0645\u0629) \u2014",
            f"  \u2022 \u0627\u0644\u0648\u0632\u0646: {L2.weight_kg or '\u2014'} \u0643\u063a \u00b7 \u062a\u062f\u062e\u064a\u0646: {L2.smoking_status or '\u2014'} \u00b7 \u0631\u064a\u0627\u0636\u0629: {L2.exercise_habits or '\u2014'}",
            f"  \u2022 \u0636\u063a\u0637 \u0627\u0644\u062f\u0645 \u0627\u0644\u0642\u0627\u0639\u062f\u064a: {L2.baseline_bp_systolic or '\u2014'}/{L2.baseline_bp_diastolic or '\u2014'}",
            f"  \u2022 \u0623\u062f\u0648\u064a\u0629 \u0637\u0648\u064a\u0644\u0629 \u0627\u0644\u0623\u0645\u062f: {_join(L2.long_term_medications)}",
            f"  \u2022 \u0645\u0643\u0645\u0644\u0627\u062a: {_join(L2.supplements)}",
            "\u2014 \u0627\u0644\u0637\u0628\u0642\u0629 3 (\u0633\u064a\u0627\u0642 \u0647\u0630\u0647 \u0627\u0644\u062c\u0644\u0633\u0629) \u2014",
            f"  \u2022 \u062d\u0645\u0644: {L3.pregnancy_status or '\u2014'} (\u0627\u0644\u0623\u0633\u0628\u0648\u0639: {L3.pregnancy_week or '\u2014'}) \u00b7 \u0631\u0636\u0627\u0639\u0629: {L3.lactation}",
            f"  \u2022 \u0627\u0644\u062a\u0647\u0627\u0628/\u062d\u0645\u0649 \u062d\u0627\u062f\u0629: {L3.acute_infection_or_fever}",
            f"  \u2022 \u0623\u062f\u0648\u064a\u0629 \u062d\u062f\u064a\u062b\u0629 (30 \u064a\u0648\u0645): {_join(L3.recent_medications)}",
            f"  \u2022 \u062c\u0631\u0627\u062d\u0627\u062a \u062d\u062f\u064a\u062b\u0629 (90 \u064a\u0648\u0645): {_join(L3.recent_surgeries)}",
            f"  \u2022 \u0635\u064a\u0627\u0645: {L3.fasting_status or '\u2014'} \u00b7 \u0633\u0628\u0628 \u0627\u0644\u0641\u062d\u0635: {L3.reason_for_test or '\u2014'}",
            f"  \u2022 \u0623\u0639\u0631\u0627\u0636 \u062d\u0627\u0644\u064a\u0629: {_join(L3.current_symptoms)}",
        ]
    else:
        block = [
            "\ud83d\udccb PATIENT CLINICAL CONTEXT (use this when interpreting):",
            "\u2014 Layer 1 (permanent) \u2014",
            f"  \u2022 Name: {L1.name or '\u2014'}",
            f"  \u2022 Age: {age if age is not None else 'unknown'} y \u00b7 Sex: {L1.sex or '\u2014'}",
            f"  \u2022 Height: {L1.height_cm or '\u2014'} cm \u00b7 Blood group: {L1.blood_group or '\u2014'}",
            f"  \u2022 Chronic diseases: {_join(L1.chronic_diseases)}",
            f"  \u2022 Drug allergies: {_join(L1.allergies)}",
            f"  \u2022 Surgical history: {_join(L1.surgical_history)}",
            f"  \u2022 Family history: {_join(L1.family_history)}",
            "\u2014 Layer 2 (semi-permanent) \u2014",
            f"  \u2022 Weight: {L2.weight_kg or '\u2014'} kg \u00b7 Smoking: {L2.smoking_status or '\u2014'} \u00b7 Exercise: {L2.exercise_habits or '\u2014'}",
            f"  \u2022 Baseline BP: {L2.baseline_bp_systolic or '\u2014'}/{L2.baseline_bp_diastolic or '\u2014'}",
            f"  \u2022 Long-term medications: {_join(L2.long_term_medications)}",
            f"  \u2022 Supplements: {_join(L2.supplements)}",
            "\u2014 Layer 3 (this-session) \u2014",
            f"  \u2022 Pregnancy: {L3.pregnancy_status or '\u2014'} (week: {L3.pregnancy_week or '\u2014'}) \u00b7 Lactation: {L3.lactation}",
            f"  \u2022 Acute infection / fever: {L3.acute_infection_or_fever}",
            f"  \u2022 Recent medications (30d): {_join(L3.recent_medications)}",
            f"  \u2022 Recent surgeries (90d): {_join(L3.recent_surgeries)}",
            f"  \u2022 Fasting: {L3.fasting_status or '\u2014'} \u00b7 Reason for test: {L3.reason_for_test or '\u2014'}",
            f"  \u2022 Current symptoms: {_join(L3.current_symptoms)}",
        ]
    return "\n".join(block)
