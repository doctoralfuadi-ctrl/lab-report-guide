"""
MidScope — Authoritative Laboratory Reference Range Engine (v2)
================================================================
Age/sex stratified reference ranges + clinical status flags.

References: WHO, IFCC, NICE, AACC, Mayo Clinic Lab Reference Values 2024,
ADA, KDIGO, NCEP-ATP III, Nelson Pediatrics, Wintrobe Clinical Hematology.

Status field returned per analyte (replaces flat `flag` from v1):
    NORMAL · LOW · HIGH · CRITICAL_LOW · CRITICAL_HIGH ·
    UNIT_ERROR · UNIT_AUTOCONVERTED · IMPLAUSIBLE_VALUE ·
    UNKNOWN_TEST · OVERRIDDEN_REFERENCE · NOT_EVALUATED

Age groups recognised:
    neonate    : 0 to ≤28 days
    infant     : 29 days to ≤12 months
    child      : 1 to ≤12 years
    adolescent : 13 to ≤17 years
    adult      : 18 to ≤64 years
    elderly    : ≥65 years

Sex: "male" | "female" | "any" (default if unspecified).
"""

import re
from typing import Optional, Dict, Any, List, Tuple

UNIT_CONVERSIONS: Dict[Tuple[str, str], float] = {
    ("mg/dl", "mmol/l"): 0.0555, ("mmol/l", "mg/dl"): 18.018,
    ("mg/dl_chol", "mmol/l_chol"): 0.02586, ("mmol/l_chol", "mg/dl_chol"): 38.67,
    ("mg/dl_tg", "mmol/l_tg"): 0.01129, ("mmol/l_tg", "mg/dl_tg"): 88.57,
    ("mg/dl_creat", "µmol/l_creat"): 88.4, ("µmol/l_creat", "mg/dl_creat"): 0.01131,
    ("mg/dl_bun", "mmol/l_urea"): 0.357, ("mmol/l_urea", "mg/dl_bun"): 2.801,
    ("mg/dl_bili", "µmol/l_bili"): 17.1, ("µmol/l_bili", "mg/dl_bili"): 0.0585,
    ("mg/dl_ca", "mmol/l_ca"): 0.25, ("mmol/l_ca", "mg/dl_ca"): 4.0,
    ("mg/dl_ua", "µmol/l_ua"): 59.48, ("µmol/l_ua", "mg/dl_ua"): 0.01681,
}

_WORD_RE = re.compile(r"[a-z0-9µ%+]+", re.IGNORECASE)

def _norm_unit(u: str) -> str:
    if not u: return ""
    return (u.strip().lower().replace("μ", "µ").replace(" ", "").replace("/litre", "/l").replace("/liter", "/l"))

def _tokens(s: str): return set(_WORD_RE.findall((s or "").lower()))

def _age_group(age: Optional[float], age_unit: str = "years") -> str:
    if age is None: return "adult"
    try: age_v = float(age)
    except (TypeError, ValueError): return "adult"
    if age_unit == "days": age_v = age_v / 365.0
    elif age_unit == "months": age_v = age_v / 12.0
    if age_v <= 28 / 365.0: return "neonate"
    if age_v <= 1.0: return "infant"
    if age_v <= 12.0: return "child"
    if age_v <= 17.0: return "adolescent"
    if age_v <= 64.0: return "adult"
    return "elderly"

def _sex_norm(sex: Optional[str]) -> str:
    if not sex: return "any"
    s = sex.strip().lower()
    if s in ("m", "male", "ذكر", "رجل"): return "male"
    if s in ("f", "female", "أنثى", "امرأة"): return "female"
    return "any"

def _r(low=None, high=None, age="adult", sex="any", clow=None, chigh=None):
    return {"age_group": age, "sex": sex, "low": low, "high": high, "critical_low": clow, "critical_high": chigh}

LAB_TESTS: List[Dict[str, Any]] = [
    {"canonical_name": "Glucose (fasting)", "aliases": ["glucose", "fasting glucose", "fpg", "fbs", "fasting blood sugar", "glucose, fasting", "fasting plasma glucose", "blood sugar fasting", "blood glucose"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 20, "high": 800}, "ranges": [_r(40, 60, age="neonate", clow=30, chigh=200), _r(60, 100, age="infant", clow=40, chigh=300), _r(70, 100, age="child", clow=50, chigh=400), _r(70, 99, age="adult", clow=50, chigh=400), _r(70, 110, age="elderly", clow=50, chigh=400)], "notes": "ADA 2024: fasting 100-125 = pre-diabetes; >=126 (x2) = diabetes."},
    {"canonical_name": "HbA1c", "aliases": ["a1c", "haemoglobin a1c", "hemoglobin a1c", "glycated hemoglobin"], "allowed_units": ["%", "mmol/mol"], "default_unit": "%", "value_bounds": {"low": 3.0, "high": 18.0}, "ranges": [_r(4.0, 5.6, age="adult", chigh=14.0), _r(4.0, 5.6, age="elderly", chigh=14.0)], "notes": "ADA 2024: 5.7-6.4 = pre-diabetes; >=6.5 = diabetes."},
    {"canonical_name": "TSH", "aliases": ["thyroid stimulating hormone", "thyrotropin", "tsh"], "allowed_units": ["miu/l", "uiu/ml", "µiu/ml"], "default_unit": "miu/l", "value_bounds": {"low": 0.01, "high": 200}, "ranges": [_r(0.7, 15.0, age="neonate", clow=0.05, chigh=50), _r(0.7, 5.7, age="infant"), _r(0.5, 4.5, age="child"), _r(0.4, 4.0, age="adolescent"), _r(0.4, 4.0, age="adult", clow=0.01, chigh=100), _r(0.4, 5.5, age="elderly", clow=0.01, chigh=100)]},
    {"canonical_name": "Free T4", "aliases": ["ft4", "free thyroxine", "free t4"], "allowed_units": ["ng/dl", "pmol/l"], "default_unit": "ng/dl", "value_bounds": {"low": 0.05, "high": 10}, "ranges": [_r(0.8, 1.8, age="adult"), _r(0.8, 2.0, age="child")]},
    {"canonical_name": "Free T3", "aliases": ["ft3", "free triiodothyronine", "free t3"], "allowed_units": ["pg/ml", "pmol/l"], "default_unit": "pg/ml", "value_bounds": {"low": 0.5, "high": 30}, "ranges": [_r(2.3, 4.2, age="adult"), _r(2.5, 5.0, age="child")]},
    {"canonical_name": "Total cholesterol", "aliases": ["cholesterol", "total chol", "tc"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 30, "high": 1200}, "ranges": [_r(0, 170, age="child"), _r(0, 200, age="adolescent"), _r(0, 200, age="adult"), _r(0, 200, age="elderly")]},
    {"canonical_name": "LDL cholesterol", "aliases": ["ldl", "ldl-c", "ldl cholesterol"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 20, "high": 800}, "ranges": [_r(0, 110, age="child"), _r(0, 100, age="adult"), _r(0, 100, age="elderly")]},
    {"canonical_name": "HDL cholesterol", "aliases": ["hdl", "hdl-c", "hdl cholesterol"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 10, "high": 200}, "ranges": [_r(40, 200, age="adult", sex="male"), _r(50, 200, age="adult", sex="female"), _r(40, 200, age="elderly"), _r(35, 200, age="child")]},
    {"canonical_name": "Triglycerides", "aliases": ["tg", "trigs"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 10, "high": 5000}, "ranges": [_r(0, 75, age="child", chigh=500), _r(0, 90, age="adolescent", chigh=500), _r(0, 150, age="adult", chigh=1000), _r(0, 150, age="elderly", chigh=1000)]},
    {"canonical_name": "Creatinine", "aliases": ["serum creatinine", "scr", "creat"], "allowed_units": ["mg/dl", "µmol/l", "umol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 0.1, "high": 25}, "ranges": [_r(0.3, 1.0, age="neonate"), _r(0.2, 0.4, age="infant"), _r(0.3, 0.7, age="child"), _r(0.5, 1.0, age="adolescent"), _r(0.7, 1.3, age="adult", sex="male", chigh=6.0), _r(0.5, 1.1, age="adult", sex="female", chigh=6.0), _r(0.8, 1.4, age="elderly", sex="male", chigh=6.0), _r(0.6, 1.2, age="elderly", sex="female", chigh=6.0)]},
    {"canonical_name": "Urea / BUN", "aliases": ["bun", "blood urea nitrogen", "urea"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 1, "high": 300}, "ranges": [_r(5, 18, age="child"), _r(7, 20, age="adult"), _r(8, 23, age="elderly")]},
    {"canonical_name": "eGFR", "aliases": ["egfr", "estimated gfr", "gfr"], "allowed_units": ["ml/min/1.73m2", "ml/min"], "default_unit": "ml/min/1.73m2", "value_bounds": {"low": 1, "high": 200}, "ranges": [_r(90, 200, age="adult", clow=15), _r(75, 200, age="elderly", clow=15)]},
    {"canonical_name": "ALT", "aliases": ["alt", "alanine aminotransferase", "sgpt"], "allowed_units": ["u/l", "iu/l"], "default_unit": "u/l", "value_bounds": {"low": 1, "high": 20000}, "ranges": [_r(5, 30, age="child"), _r(7, 40, age="adult", sex="male"), _r(7, 35, age="adult", sex="female"), _r(7, 45, age="elderly")]},
    {"canonical_name": "AST", "aliases": ["ast", "aspartate aminotransferase", "sgot"], "allowed_units": ["u/l", "iu/l"], "default_unit": "u/l", "value_bounds": {"low": 1, "high": 20000}, "ranges": [_r(15, 50, age="child"), _r(10, 40, age="adult", sex="male"), _r(10, 35, age="adult", sex="female"), _r(10, 45, age="elderly")]},
    {"canonical_name": "Total bilirubin", "aliases": ["bilirubin", "tbil"], "allowed_units": ["mg/dl", "µmol/l", "umol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 0.05, "high": 60}, "ranges": [_r(1.0, 12.0, age="neonate", chigh=20.0), _r(0.1, 1.2, age="adult", chigh=15.0), _r(0.1, 1.2, age="elderly", chigh=15.0)]},
    {"canonical_name": "Albumin", "aliases": ["serum albumin", "alb"], "allowed_units": ["g/dl", "g/l"], "default_unit": "g/dl", "value_bounds": {"low": 0.5, "high": 8.0}, "ranges": [_r(3.8, 5.4, age="child"), _r(3.5, 5.0, age="adult"), _r(3.2, 4.6, age="elderly")]},
    {"canonical_name": "Hemoglobin", "aliases": ["hb", "hgb", "haemoglobin"], "allowed_units": ["g/dl", "g/l"], "default_unit": "g/dl", "value_bounds": {"low": 2.0, "high": 25.0}, "ranges": [_r(14.0, 24.0, age="neonate", clow=9.0, chigh=22.0), _r(9.0, 14.0, age="infant", clow=6.0), _r(11.0, 15.0, age="child", clow=6.0), _r(12.5, 16.1, age="adolescent", sex="male", clow=6.0), _r(11.7, 14.7, age="adolescent", sex="female", clow=6.0), _r(13.5, 17.5, age="adult", sex="male", clow=6.0, chigh=20.0), _r(12.0, 15.5, age="adult", sex="female", clow=6.0, chigh=20.0), _r(12.5, 17.0, age="elderly", sex="male", clow=6.0), _r(11.5, 15.5, age="elderly", sex="female", clow=6.0)]},
    {"canonical_name": "WBC", "aliases": ["wbc", "white blood cell count", "leukocytes"], "allowed_units": ["10^3/µl", "k/µl", "10^9/l", "x10^9/l"], "default_unit": "10^3/µl", "value_bounds": {"low": 0.1, "high": 500}, "ranges": [_r(9.0, 30.0, age="neonate", clow=4.0, chigh=50.0), _r(6.0, 17.0, age="infant", clow=2.5, chigh=40.0), _r(5.0, 14.5, age="child", clow=2.0), _r(4.5, 13.0, age="adolescent", clow=2.0), _r(4.0, 11.0, age="adult", clow=1.0, chigh=50.0), _r(3.5, 10.5, age="elderly", clow=1.0)]},
    {"canonical_name": "Platelets", "aliases": ["plt", "platelet count", "thrombocytes"], "allowed_units": ["10^3/µl", "k/µl", "10^9/l"], "default_unit": "10^3/µl", "value_bounds": {"low": 1, "high": 3000}, "ranges": [_r(150, 450, age="neonate", clow=50, chigh=1000), _r(150, 450, age="adult", clow=20, chigh=1000), _r(150, 450, age="elderly", clow=20, chigh=1000)]},
    {"canonical_name": "Sodium", "aliases": ["na", "sodium", "na+"], "allowed_units": ["mmol/l", "meq/l"], "default_unit": "mmol/l", "value_bounds": {"low": 100, "high": 200}, "ranges": [_r(135, 145, age="adult", clow=120, chigh=160), _r(135, 145, age="elderly", clow=120, chigh=160), _r(133, 146, age="child")]},
    {"canonical_name": "Potassium", "aliases": ["k", "potassium", "k+"], "allowed_units": ["mmol/l", "meq/l"], "default_unit": "mmol/l", "value_bounds": {"low": 1.0, "high": 10.0}, "ranges": [_r(3.7, 5.9, age="neonate", clow=3.0, chigh=7.0), _r(3.4, 5.5, age="infant"), _r(3.5, 5.0, age="child"), _r(3.5, 5.0, age="adult", clow=2.5, chigh=6.5), _r(3.5, 5.0, age="elderly", clow=2.5, chigh=6.5)]},
    {"canonical_name": "Calcium", "aliases": ["ca", "calcium", "total calcium"], "allowed_units": ["mg/dl", "mmol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 4.0, "high": 16.0}, "ranges": [_r(8.8, 10.6, age="child"), _r(8.6, 10.3, age="adult", clow=6.5, chigh=13.5), _r(8.4, 10.2, age="elderly", clow=6.5, chigh=13.5)]},
    {"canonical_name": "Troponin I", "aliases": ["troponin", "trop i", "ctni"], "allowed_units": ["ng/ml", "ng/l", "pg/ml"], "default_unit": "ng/ml", "value_bounds": {"low": 0, "high": 1000}, "ranges": [_r(0, 0.04, age="adult", chigh=0.5), _r(0, 0.04, age="elderly", chigh=0.5)]},
    {"canonical_name": "CRP", "aliases": ["c-reactive protein", "crp"], "allowed_units": ["mg/l", "mg/dl"], "default_unit": "mg/l", "value_bounds": {"low": 0, "high": 500}, "ranges": [_r(0, 5.0, age="adult"), _r(0, 5.0, age="elderly"), _r(0, 5.0, age="child")]},
    {"canonical_name": "ESR", "aliases": ["esr", "sedimentation rate"], "allowed_units": ["mm/h", "mm/hr"], "default_unit": "mm/h", "value_bounds": {"low": 0, "high": 200}, "ranges": [_r(0, 13, age="child"), _r(0, 15, age="adult", sex="male"), _r(0, 20, age="adult", sex="female"), _r(0, 20, age="elderly", sex="male"), _r(0, 30, age="elderly", sex="female")]},
    {"canonical_name": "Vitamin D (25-OH)", "aliases": ["vitamin d", "25-oh-d", "25 hydroxy vitamin d"], "allowed_units": ["ng/ml", "nmol/l"], "default_unit": "ng/ml", "value_bounds": {"low": 1, "high": 500}, "ranges": [_r(30, 100, age="adult"), _r(30, 100, age="elderly"), _r(30, 100, age="child")]},
    {"canonical_name": "Vitamin B12", "aliases": ["b12", "cobalamin"], "allowed_units": ["pg/ml", "pmol/l"], "default_unit": "pg/ml", "value_bounds": {"low": 30, "high": 5000}, "ranges": [_r(200, 900, age="adult"), _r(200, 900, age="elderly"), _r(300, 1000, age="child")]},
    {"canonical_name": "Ferritin", "aliases": ["ferritin"], "allowed_units": ["ng/ml", "µg/l", "ug/l"], "default_unit": "ng/ml", "value_bounds": {"low": 1, "high": 50000}, "ranges": [_r(30, 400, age="child"), _r(24, 336, age="adult", sex="male"), _r(11, 307, age="adult", sex="female"), _r(20, 250, age="elderly")]},
    {"canonical_name": "PSA", "aliases": ["psa", "prostate specific antigen"], "allowed_units": ["ng/ml"], "default_unit": "ng/ml", "value_bounds": {"low": 0, "high": 5000}, "ranges": [_r(0, 2.5, age="adult", sex="male"), _r(0, 4.5, age="elderly", sex="male")]},
    {"canonical_name": "Uric acid", "aliases": ["uric acid", "urate"], "allowed_units": ["mg/dl", "µmol/l", "umol/l"], "default_unit": "mg/dl", "value_bounds": {"low": 1, "high": 30}, "ranges": [_r(2.0, 5.5, age="child"), _r(3.4, 7.0, age="adult", sex="male"), _r(2.4, 6.0, age="adult", sex="female"), _r(3.4, 7.0, age="elderly", sex="male"), _r(2.4, 6.5, age="elderly", sex="female")]}
]

def _find_test(name: str) -> Optional[Dict[str, Any]]:
    if not name: return None
    q = name.strip().lower()
    qtok = _tokens(q)
    for t in LAB_TESTS:
        if t["canonical_name"].lower() == q: return t
        for alias in t.get("aliases", []):
            if alias.lower() == q: return t
    for t in LAB_TESTS:
        canon_tok = _tokens(t["canonical_name"])
        if canon_tok and canon_tok.issubset(qtok): return t
        for alias in t.get("aliases", []):
            atok = _tokens(alias)
            if len(atok) >= 2 and atok.issubset(qtok): return t
    return None

def _pick_range(test, age_group, sex):
    ranges = test.get("ranges", [])
    if not ranges: return None
    for r in ranges:
        if r["age_group"] == age_group and r["sex"] == sex: return r
    for r in ranges:
        if r["age_group"] == age_group and r["sex"] == "any": return r
    for r in ranges:
        if r["age_group"] == "adult" and r["sex"] == sex: return r
    for r in ranges:
        if r["age_group"] == "adult" and r["sex"] == "any": return r
    return ranges[0]

def _clinical_status(value, rng):
    clow, chigh = rng.get("critical_low"), rng.get("critical_high")
    low, high = rng.get("low"), rng.get("high")
    if clow is not None and value <= clow: return "CRITICAL_LOW"
    if chigh is not None and value >= chigh: return "CRITICAL_HIGH"
    if low is not None and value < low: return "LOW"
    if high is not None and value > high: return "HIGH"
    return "NORMAL"

PREGNANCY_OVERRIDES = {
    "Glucose (fasting)": {"low": 70, "high": 92, "critical_high": 200},
    "HbA1c": {"low": 4.0, "high": 6.0},
    "TSH": {"low": 0.1, "high": 2.5},
    "Hemoglobin": {"low": 11.0, "high": 15.0, "critical_low": 7.0},
}

def _apply_pregnancy_override(test, rng):
    override = PREGNANCY_OVERRIDES.get(test["canonical_name"])
    if not override: return rng or {}
    base = dict(rng or {})
    for k in ("low", "high", "critical_low", "critical_high"):
        if k in override: base[k] = override[k]
    return base

def normalise_lab_entry(entry, patient=None):
    patient = patient or {}
    age_group = _age_group(patient.get("age"), patient.get("age_unit", "years"))
    sex = _sex_norm(patient.get("sex"))
    raw_name = (entry.get("name") or "").strip()
    raw_value = entry.get("value")
    raw_unit = _norm_unit(entry.get("unit") or "")
    raw_ref = entry.get("refRange")
    out = {"name": raw_name, "canonical_name": None, "value": raw_value, "unit_provided": raw_unit or None, "unit_normalised": raw_unit or None, "reference_range": None, "age_group": age_group, "sex": sex, "clinical_status": "NOT_EVALUATED", "flag": "OK", "flag_reason": None, "critical": None, "notes": None}
    test = _find_test(raw_name)
    if not test:
        out["flag"] = "UNKNOWN_TEST"
        out["flag_reason"] = "Test not in MidScope authoritative database."
        if raw_ref:
            out["reference_range"] = raw_ref
            out["flag"] = "OVERRIDDEN_REFERENCE"
        return out
    out["canonical_name"] = test["canonical_name"]
    out["notes"] = test.get("notes")
    rng = _pick_range(test, age_group, sex)
    if patient.get("pregnant") and sex == "female":
        rng = _apply_pregnancy_override(test, rng)
    if rng:
        out["reference_range"] = {"low": rng.get("low"), "high": rng.get("high")}
        if rng.get("critical_low") is not None or rng.get("critical_high") is not None:
            out["critical"] = {"low": rng.get("critical_low"), "high": rng.get("critical_high")}
    allowed = [_norm_unit(u) for u in test["allowed_units"]]
    default_unit = _norm_unit(test["default_unit"])
    if raw_unit and raw_unit not in allowed:
        out["flag"] = "UNIT_ERROR"
        out["flag_reason"] = f"Unit '{raw_unit}' not valid for {test['canonical_name']}."
        out["unit_normalised"] = default_unit
        return out
    if raw_unit and raw_unit != default_unit:
        candidates = [(raw_unit, default_unit), (raw_unit+"_chol", default_unit+"_chol"), (raw_unit+"_tg", default_unit+"_tg"), (raw_unit+"_creat", default_unit+"_creat"), (raw_unit+"_bun", default_unit+"_urea"), (raw_unit+"_bili", default_unit+"_bili"), (raw_unit+"_ca", default_unit+"_ca"), (raw_unit+"_ua", default_unit+"_ua")]
        for key in candidates:
            if key in UNIT_CONVERSIONS:
                try:
                    out["value"] = round(float(raw_value) * UNIT_CONVERSIONS[key], 3)
                    out["unit_normalised"] = default_unit
                    out["flag"] = "UNIT_AUTOCONVERTED"
                    break
                except (TypeError, ValueError): pass
        if out["flag"] == "OK": out["unit_normalised"] = raw_unit
    bounds = test.get("value_bounds")
    if bounds is not None and out["value"] is not None:
        try:
            v = float(out["value"])
            if v < bounds["low"] or v > bounds["high"]:
                out["flag"] = "IMPLAUSIBLE_VALUE"
                return out
        except (TypeError, ValueError): pass
    if rng and out["value"] is not None:
        try: out["clinical_status"] = _clinical_status(float(out["value"]), rng)
        except (TypeError, ValueError): pass
    return out

def normalise_lab_entries(entries, patient=None):
    return [normalise_lab_entry(e, patient) for e in (entries or [])]

def render_normalised_panel_for_prompt(normalised, language="en"):
    if not normalised: return ""
    lines = ["AUTHORITATIVE LAB PANEL (MidScope Reference Range Engine v2):"]
    for n in normalised:
        if not n.get("canonical_name") and n["flag"] == "UNKNOWN_TEST":
            lines.append(f"  * {n['name']} = {n['value']} {n['unit_provided'] or '?'} [UNKNOWN_TEST]")
            continue
        rr = n.get("reference_range") or {}
        rr_str = f"{rr.get('low','?')}-{rr.get('high','?')} {n['unit_normalised']}"
        line = f"  * {n['canonical_name']} = {n['value']} {n['unit_normalised']} [{n['clinical_status']}] (ref {rr_str} for {n['age_group']}/{n['sex']})"
        if n["flag"] not in ("OK", "UNIT_AUTOCONVERTED"): line += f" [{n['flag']}]"
        lines.append(line)
    return "\n".join(lines)
