from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import tempfile
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from lab_reference_db import (
    normalise_lab_entries,
    render_normalised_panel_for_prompt,
    LAB_TESTS,
)
from health_profile import (
    SmartHealthProfile,
    derive_patient_context,
    render_profile_for_prompt,
    calculate_age_years,
)
import uuid
from datetime import datetime, timezone, timedelta, date

from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="MediReader API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class NewsletterCreate(BaseModel):
    email: EmailStr


class ManualAnalyzeRequest(BaseModel):
    tests: List[dict]  # [{name, value, unit, ref_range}]
    audience: str = "patient"  # patient | specialist
    language: str = "ar"  # ar, en, fr, es, de, tr, ur, hi, zh, ru ...
    notes: Optional[str] = None
    profile: Optional[SmartHealthProfile] = None  # 3-layer patient context


class RecommendTestsRequest(BaseModel):
    condition: str
    audience: str = "patient"
    language: str = "ar"


class ReminderCreate(BaseModel):
    email: EmailStr
    condition: str
    frequencyMonths: int = 6
    lastTestDate: Optional[str] = None  # ISO YYYY-MM-DD, defaults to today
    language: str = "ar"
    audience: str = "patient"


class Reminder(BaseModel): 
    id: str
    email: str
    condition: str
    frequencyMonths: int
    lastTestDate: str
    nextDueDate: str
    language: str
    audience: str
    createdAt: str


class HealthEntryCreate(BaseModel):
    email: EmailStr
    label: str          # test name e.g., "Hemoglobin", "Glucose"
    value: float        # numeric value
    unit: Optional[str] = None
    refLow: Optional[float] = None
    refHigh: Optional[float] = None
    date: Optional[str] = None   # ISO YYYY-MM-DD; defaults today
    notes: Optional[str] = None
    sourceId: Optional[str] = None  # link to analysis id


class HealthEntry(BaseModel):
    id: str
    email: str
    label: str
    value: float
    unit: Optional[str] = None
    refLow: Optional[float] = None
    refHigh: Optional[float] = None
    date: str
    notes: Optional[str] = None
    sourceId: Optional[str] = None
    createdAt: str


class SubscriptionStart(BaseModel):
    email: EmailStr
    plan: str         # "standard" | "premium"
    billing: str = "yearly"  # "yearly" | "monthly"
    currency: str = "USD"    # "USD" | "IQD"
    priceValue: str          # display price for the user record
    acceptedTerms: bool = False


# ---------- Checkout (Simulated Stripe-style) ----------
class CheckoutSessionCreate(BaseModel):
    email: EmailStr
    plan: str          # "standard" | "premium"
    billing: str       # "monthly" | "yearly"
    currency: str      # "USD" | "IQD"
    priceValue: str
    acceptedTerms: bool = False


class CheckoutSession(BaseModel):
    sessionId: str
    email: str
    plan: str
    billing: str
    currency: str
    priceValue: str
    status: str        # "open" | "completed" | "expired"
    createdAt: str


class CheckoutConfirm(BaseModel):
    sessionId: str
    # Card details are accepted by the simulated gateway but NEVER stored.
    cardholderName: str
    cardLast4: Optional[str] = None  # only last 4 digits derived client-side; never PAN
    expiryMonth: Optional[str] = None
    expiryYear: Optional[str] = None


# ---------- ZainCash / Rafidain SuperKey models (transaction-ID flow) ----------
# Privacy principle: the customer NEVER sees the merchant's personal bank account.
# They only see the trade name "MidScope" and a unique payment reference code
# they include in the memo of their transfer. The "Automation Robot" then verifies the
# transaction ID returned by the provider app.

class PaymentInitiate(BaseModel):
    email: EmailStr
    plan: str           # "standard" | "premium"
    billing: str        # "monthly" | "yearly"
    currency: str       # "USD" | "IQD"
    priceValue: str
    provider: str       # "zaincash" | "rafidain"
    acceptedTerms: bool = False


class PaymentIntent(BaseModel):
    paymentId: str
    referenceCode: str     # included in the transfer memo, e.g., TLK-7K3M9X
    merchantDisplayName: str  # "MidScope" (NO personal bank details)
    provider: str
    amount: str
    currency: str
    plan: str
    billing: str
    email: str
    status: str            # "awaiting_payment" | "verified" | "expired" | "rejected"
    createdAt: str
    expiresAt: str


class PaymentVerify(BaseModel):
    paymentId: str
    txnId: str             # transaction ID from ZainCash receipt / Rafidain receipt


MERCHANT_DISPLAY_NAME = "MidScope"


class Subscription(BaseModel):
    id: str
    email: str
    plan: str
    billing: str
    currency: str
    priceValue: str
    autoRenew: bool
    status: str  # "active" | "cancelled"
    startedAt: str
    nextRenewalAt: str
    cancelledAt: Optional[str] = None


class AnalysisResponse(BaseModel):
    id: str
    interpretation: str
    timestamp: str


# ---------- Helpers ----------
def _system_prompt(audience: str, language: str) -> str:
    lang_map = {
        "ar": "Arabic (العربية)",
        "en": "English",
        "fr": "French (Français)",
        "es": "Spanish (Español)",
        "de": "German (Deutsch)",
        "tr": "Turkish (Türkçe)",
        "ur": "Urdu (اردو)",
        "hi": "Hindi (हिन्दी)",
        "zh": "Chinese (中文)",
        "ru": "Russian (Русский)",
        "pt": "Portuguese",
        "it": "Italian",
        "ja": "Japanese",
        "ko": "Korean",
        "fa": "Persian (Farsi)",
    }
    language_name = lang_map.get(language, language)

    if audience == "specialist":
        tone = (
            "You are an expert clinical pathologist assistant. Provide a TECHNICAL, "
            "detailed interpretation with differentials, possible underlying mechanisms, "
            "clinically significant ranges, suggested follow-up labs, and ICD/clinical correlations. "
            "Use medical terminology freely. Be precise."
        )
    else:
        tone = (
            "You are a warm, clear medical educator helping a patient understand their lab tests. "
            "Use simple, friendly language. Avoid jargon (or explain it). Reassure when appropriate. "
            "Provide: 1) what each test means, 2) whether the value is normal/low/high in plain language, "
            "3) possible everyday reasons, 4) lifestyle suggestions, 5) when to see a doctor."
        )

    return (
        f"{tone}\n\n"
        f"Always respond ENTIRELY in {language_name}.\n\n"
        "==================== CRITICAL MEDICAL SAFETY GUARDRAILS ====================\n"
        "1. NEVER suggest or recommend the Oral Glucose Tolerance Test (OGTT / GTT / "
        "   75g glucose challenge / تحمل الجلوكوز الفموي / منحنى السكر) for any patient who "
        "   already has Diabetes Mellitus (Type 1 OR Type 2, including gestational DM that is "
        "   already diagnosed). OGTT is contra-indicated in diagnosed diabetics — it can cause "
        "   severe hyperglycemia, dehydration, and DKA. \n"
        "   Triggers that mean the patient IS diabetic (DO NOT order OGTT):\n"
        "   • HbA1c ≥ 6.5% (48 mmol/mol) on the current report or prior history\n"
        "   • Fasting Plasma Glucose (FPG / FBS) ≥ 126 mg/dL (7.0 mmol/L) on two readings or with symptoms\n"
        "   • Random Plasma Glucose ≥ 200 mg/dL (11.1 mmol/L) with classic symptoms\n"
        "   • Any explicit mention of T1DM, T2DM, diabetes, السكري, السكر, ديابيتيس, insulin therapy, "
        "     metformin, sulfonylurea, GLP-1 agonist, SGLT2 inhibitor in the report or history.\n"
        "   For confirmed diabetics, monitor with HbA1c every 3 months, FPG, lipid panel, "
        "   kidney function (creatinine + microalbuminuria), and retinal/foot screening instead.\n"
        "2. Only consider OGTT for: undiagnosed prediabetes work-up (HbA1c 5.7–6.4 or FPG 100–125), "
        "   gestational diabetes screening at 24–28 weeks in NON-diabetic pregnancies, "
        "   reactive hypoglycemia work-up, acromegaly evaluation. State the indication explicitly.\n"
        "============================================================================\n\n"
        "FORMAT your response in clean Markdown with these sections (translate the section titles "
        f"into {language_name}):\n"
        "## Summary\n"
        "## Test-by-Test Analysis\n"
        "## Key Findings\n"
        "## Personalized Diet Plan\n"
        "(Provide an actionable diet plan TAILORED to the abnormal values and the patient's condition. "
        "Include TWO clear bulleted lists: 'Foods to Eat' (specific, practical foods — e.g., 'lean grilled "
        "chicken, oily fish like salmon, leafy greens, lentils, oats') and 'Foods to Avoid/Limit' "
        "(specific items — e.g., 'refined sugar, fried foods, processed meats'). Mention hydration "
        "and a suggested daily meal structure when relevant.)\n"
        "## Exercise & Physical Activity Plan\n"
        "(Provide a practical exercise plan tailored to the findings: type of exercise — e.g., 'brisk "
        "walking 30 minutes, 5×/week; light resistance training 2×/week; yoga or stretching for stress'. "
        "Include intensity level, weekly frequency, and any precautions based on the abnormal values.)\n"
        "## Recommendations\n"
        "(Other actionable steps: supplements to discuss with a doctor, follow-up labs, sleep, stress.)\n"
        "## Important Disclaimer\n\n"
        "End with a clear disclaimer that this is informational only and not a substitute for a "
        "qualified physician's evaluation."
    )


async def _run_llm(system_prompt: str, user_text: str, files=None, images=None) -> str:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "LLM key not configured")

    session_id = f"analyze-{uuid.uuid4()}"
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_prompt,
    ).with_model("gemini", "gemini-2.5-pro")

    msg_kwargs = {"text": user_text}
    if files:
        msg_kwargs["file_contents"] = files
    if images:
        msg_kwargs["file_contents"] = (msg_kwargs.get("file_contents") or []) + images

    response = await chat.send_message(UserMessage(**msg_kwargs))
    return response


async def _save_analysis(kind: str, audience: str, language: str, interpretation: str) -> dict:
    doc = {
        "id": str(uuid.uuid4()),
        "kind": kind,
        "audience": audience,
        "language": language,
        "interpretation": interpretation,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.analyses.insert_one(doc.copy())
    return doc


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "MediReader API", "status": "ok"}


@api_router.post("/analyze/image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    audience: str = Form("patient"),
    language: str = Form("ar"),
):
    content_type = file.content_type or "image/png"
    if not content_type.startswith("image/"):
        raise HTTPException(400, "Only image files accepted")

    suffix = "." + (content_type.split("/")[-1] or "png")
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        data = await file.read()
        tmp.write(data)
        tmp_path = tmp.name

    try:
        # Gemini supports image via FileContentWithMimeType
        image_file = FileContentWithMimeType(file_path=tmp_path, mime_type=content_type)
        system = _system_prompt(audience, language)
        user_text = (
            "Please read this lab test image carefully, extract every test name, value, unit and reference range you can see, "
            "then interpret the results."
        )
        interp = await _run_llm(system, user_text, files=[image_file])
        doc = await _save_analysis("image", audience, language, interp)
        return AnalysisResponse(id=doc["id"], interpretation=interp, timestamp=doc["timestamp"])
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


@api_router.post("/analyze/pdf", response_model=AnalysisResponse)
async def analyze_pdf(
    file: UploadFile = File(...),
    audience: str = Form("patient"),
    language: str = Form("ar"),
):
    if (file.content_type or "").lower() != "application/pdf" and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        data = await file.read()
        tmp.write(data)
        tmp_path = tmp.name

    try:
        pdf_file = FileContentWithMimeType(file_path=tmp_path, mime_type="application/pdf")
        system = _system_prompt(audience, language)
        user_text = (
            "Read this PDF lab report carefully. Extract every test, value, unit and reference range. "
            "Then interpret the full report."
        )
        interp = await _run_llm(system, user_text, files=[pdf_file])
        doc = await _save_analysis("pdf", audience, language, interp)
        return AnalysisResponse(id=doc["id"], interpretation=interp, timestamp=doc["timestamp"])
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


@api_router.post("/labs/normalise")
async def labs_normalise(body: Dict[str, Any]):
    """Preview the normalisation of a lab panel — accepts optional patient profile
    so age/sex stratified reference ranges are used."""
    entries = body.get("entries") or []
    if not isinstance(entries, list):
        raise HTTPException(400, "Expected {entries: [...], profile?: {...}} payload")
    profile_data = body.get("profile") or {}
    try:
        profile = SmartHealthProfile(**profile_data) if profile_data else SmartHealthProfile()
    except Exception:
        profile = SmartHealthProfile()
    patient_ctx = derive_patient_context(profile)
    normalised = normalise_lab_entries(entries, patient=patient_ctx)
    return {
        "patient_context": {
            "age_years": patient_ctx.get("age"),
            "sex": patient_ctx.get("sex"),
            "age_group_resolved": normalised[0]["age_group"] if normalised else None,
        },
        "normalised": normalised,
        "summary": {
            "total": len(normalised),
            "normal": sum(1 for n in normalised if n.get("clinical_status") == "NORMAL"),
            "low_high": sum(1 for n in normalised if n.get("clinical_status") in {"LOW", "HIGH"}),
            "critical": sum(1 for n in normalised if n.get("clinical_status") in {"CRITICAL_LOW", "CRITICAL_HIGH"}),
            "errors": sum(1 for n in normalised if n["flag"] in {"UNIT_ERROR", "IMPLAUSIBLE_VALUE"}),
            "auto_corrected": sum(1 for n in normalised if n["flag"] in {"UNIT_AUTOCONVERTED", "OVERRIDDEN_REFERENCE"}),
            "unknown": sum(1 for n in normalised if n["flag"] == "UNKNOWN_TEST"),
        },
    }


@api_router.post("/profile/preview")
async def profile_preview(profile: SmartHealthProfile):
    """Echo back the parsed Smart Health Profile + the computed age + the rendered
    clinical-metadata block, so the frontend can confirm before submitting an analysis."""
    age = calculate_age_years(profile.layer1.date_of_birth)
    return {
        "age_years": age,
        "sex": profile.layer1.sex,
        "patient_context": derive_patient_context(profile),
        "rendered_metadata_en": render_profile_for_prompt(profile, language="en"),
        "rendered_metadata_ar": render_profile_for_prompt(profile, language="ar"),
    }


@api_router.get("/labs/reference-db")
async def labs_reference_db():
    """Return the public-facing summary of the authoritative reference database."""
    return {
        "count": len(LAB_TESTS),
        "tests": [
            {
                "canonical_name": t["canonical_name"],
                "default_unit": t["default_unit"],
                "allowed_units": t["allowed_units"],
                "reference_range": t["reference_range"],
                "notes": t.get("notes"),
            }
            for t in LAB_TESTS
        ],
    }


@api_router.post("/analyze/manual", response_model=AnalysisResponse)
async def analyze_manual(body: ManualAnalyzeRequest):
    if not body.tests:
        raise HTTPException(400, "Provide at least one test")

    # === Authoritative Lab Reference DB pass-through ===
    # Normalise EVERY user entry against MidScope's curated reference DB.
    # The AI must reason on normalised values + IFCC ranges, NEVER on the
    # patient-supplied ranges (which can be wrong, fabricated, or unit-confused).
    raw_entries = []
    for t in body.tests:
        name = (t.get("name") or "").strip() if isinstance(t.get("name"), str) else ""
        if not name:
            continue
        raw_entries.append({
            "name": name,
            "value": t.get("value"),
            "unit": t.get("unit") or "",
            "refRange": t.get("ref_range") or t.get("range") or t.get("refRange"),
        })

    if not raw_entries:
        raise HTTPException(400, "Provide at least one valid test row")

    # Derive patient context (age computed live from DOB; sex from Layer 1)
    profile = body.profile or SmartHealthProfile()
    patient_ctx = derive_patient_context(profile)
    normalised = normalise_lab_entries(raw_entries, patient=patient_ctx)
    panel_block = render_normalised_panel_for_prompt(normalised, language=body.language)
    profile_block = render_profile_for_prompt(profile, language=body.language)

    user_text = profile_block + "\n\n" + panel_block
    if body.notes:
        user_text += f"\n\nPatient notes: {body.notes}"

    system = _system_prompt(body.audience, body.language) + (
        "\n\nCRITICAL: You will receive (a) a PATIENT CLINICAL CONTEXT block with 3 layers "
        "(permanent / semi-permanent / this-session) and (b) an AUTHORITATIVE LAB PANEL. "
        "You MUST personalise the interpretation using the patient's age, sex, chronic diseases, "
        "medications, pregnancy/fasting status, and current symptoms. Use ONLY the reference "
        "ranges and clinical statuses (NORMAL/LOW/HIGH/CRITICAL_*) shown in the lab panel — "
        "never the patient-claimed ranges. If any entry is flagged UNIT_ERROR, IMPLAUSIBLE_VALUE, "
        "or CRITICAL_*, surface that prominently. Example phrasing: 'Your Hemoglobin of 11 g/dL "
        "is slightly low for an adult male aged 42 with no chronic conditions — workup for iron "
        "deficiency is recommended.'"
    )
    interp = await _run_llm(system, user_text)
    doc = await _save_analysis("manual", body.audience, body.language, interp)
    return AnalysisResponse(id=doc["id"], interpretation=interp, timestamp=doc["timestamp"])


@api_router.post("/recommend-tests", response_model=AnalysisResponse)
async def recommend_tests(body: RecommendTestsRequest):
    condition = body.condition.strip()
    if not condition:
        raise HTTPException(400, "Provide a condition or symptoms")

    lang_map = {
        "ar": "Arabic (العربية)", "en": "English", "fr": "French", "es": "Spanish",
        "de": "German", "tr": "Turkish", "ur": "Urdu", "hi": "Hindi", "zh": "Chinese",
        "ru": "Russian", "pt": "Portuguese", "it": "Italian", "ja": "Japanese",
        "ko": "Korean", "fa": "Persian",
    }
    language_name = lang_map.get(body.language, body.language)

    if body.audience == "specialist":
        tone = (
            "You are an expert clinical pathologist. Recommend appropriate laboratory tests "
            "for the given clinical case. Be precise, evidence-based, and aligned with current "
            "clinical guidelines (e.g., ADA, AHA, KDIGO where applicable)."
        )
    else:
        tone = (
            "You are a friendly medical educator guiding a patient. Recommend the laboratory tests "
            "commonly used to investigate the given condition or symptoms. Use plain, reassuring language."
        )

    system_prompt = (
        f"{tone}\n\n"
        f"Always respond ENTIRELY in {language_name}.\n\n"
        "==================== CRITICAL MEDICAL SAFETY GUARDRAILS ====================\n"
        "DO NOT recommend the Oral Glucose Tolerance Test (OGTT / GTT / 75g glucose challenge / "
        "تحمل الجلوكوز الفموي / منحنى السكر) when the condition/symptoms indicate the patient is "
        "ALREADY diabetic. This includes any of: confirmed Type 1 or Type 2 Diabetes Mellitus, "
        "HbA1c ≥ 6.5%, FPG ≥ 126 mg/dL on two readings, random glucose ≥ 200 mg/dL with symptoms, "
        "or current treatment with insulin, metformin, sulfonylureas, GLP-1 agonists, or SGLT2 "
        "inhibitors. OGTT in diagnosed diabetics can cause severe hyperglycemia and DKA — it is "
        "contra-indicated. Instead recommend: HbA1c (every 3 months), FPG, lipid panel, "
        "kidney function (creatinine + microalbuminuria), and ophthalmology/foot screening.\n"
        "OGTT is only appropriate for: undiagnosed prediabetes work-up, gestational diabetes "
        "screening (24–28 weeks) in non-diabetic pregnancies, reactive hypoglycemia, or acromegaly.\n"
        "============================================================================\n\n"
        "FORMAT your response in clean Markdown with these sections (translate the section titles "
        f"into {language_name}):\n"
        "## Overview\n(Briefly explain what this condition is and why lab tests help.)\n\n"
        "## Essential First-line Tests\n(Bulleted list — each item: test name, what it shows, why it's needed.)\n\n"
        "## Additional / Confirmatory Tests\n(Bulleted list — tests that may be added based on results.)\n\n"
        "## Preparation Tips\n(Fasting, timing, medications to disclose.)\n\n"
        "## Personalized Diet Plan\n"
        "(Two bulleted lists for THIS condition: 'Foods to Eat' (specific items) and "
        "'Foods to Avoid/Limit' (specific items). Keep it practical and easy to follow.)\n\n"
        "## Exercise & Lifestyle\n"
        "(A practical activity plan: type, frequency, intensity, and precautions specific to this condition.)\n\n"
        "## When to See a Doctor\n\n"
        "## Important Disclaimer\n"
        "End with a clear disclaimer that this is informational only and not a substitute for a qualified physician's evaluation."
    )

    user_text = f"Condition / symptoms: {condition}\n\nRecommend the laboratory tests needed."
    interp = await _run_llm(system_prompt, user_text)
    doc = await _save_analysis("recommend", body.audience, body.language, interp)
    return AnalysisResponse(id=doc["id"], interpretation=interp, timestamp=doc["timestamp"])


# ---------- Reminders ----------
def _add_months(d: date, months: int) -> date:
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    # clamp day to last valid day of target month
    import calendar
    last_day = calendar.monthrange(year, month)[1]
    day = min(d.day, last_day)
    return date(year, month, day)


def _compute_next_due(last_test_iso: str, frequency_months: int) -> str:
    try:
        last = date.fromisoformat(last_test_iso)
    except Exception:
        last = date.today()
    return _add_months(last, frequency_months).isoformat()


@api_router.post("/reminders", response_model=Reminder)
async def create_reminder(body: ReminderCreate):
    last_iso = body.lastTestDate or date.today().isoformat()
    try:
        date.fromisoformat(last_iso)
    except Exception:
        raise HTTPException(400, "Invalid lastTestDate (expected YYYY-MM-DD)")

    next_iso = _compute_next_due(last_iso, body.frequencyMonths)

    doc = {
        "id": str(uuid.uuid4()),
        "email": body.email,
        "condition": body.condition.strip(),
        "frequencyMonths": body.frequencyMonths,
        "lastTestDate": last_iso,
        "nextDueDate": next_iso,
        "language": body.language,
        "audience": body.audience,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.reminders.insert_one(doc.copy())
    return Reminder(**doc)


@api_router.get("/reminders", response_model=List[Reminder])
async def list_reminders(email: str):
    cursor = db.reminders.find({"email": email}, {"_id": 0}).sort("nextDueDate", 1)
    items = await cursor.to_list(500)
    return [Reminder(**r) for r in items]


@api_router.delete("/reminders/{rid}")
async def delete_reminder(rid: str):
    res = await db.reminders.delete_one({"id": rid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Reminder not found")
    return {"ok": True}


@api_router.post("/reminders/{rid}/mark-done", response_model=Reminder)
async def mark_done(rid: str):
    today_iso = date.today().isoformat()
    existing = await db.reminders.find_one({"id": rid}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Reminder not found")
    next_iso = _compute_next_due(today_iso, existing["frequencyMonths"])
    await db.reminders.update_one({"id": rid}, {"$set": {"lastTestDate": today_iso, "nextDueDate": next_iso}})
    updated = await db.reminders.find_one({"id": rid}, {"_id": 0})
    return Reminder(**updated)


@api_router.get("/reminders/recommended-frequency")
async def recommended_frequency(condition: str):
    """Suggests a follow-up frequency (in months) for a given clinical condition.
    Heuristic based on common guidelines."""
    c = condition.lower()
    rules = [
        (("diabetes", "hba1c", "السكري", "السكر"), 3),
        (("hypertension", "blood pressure", "ضغط"), 6),
        (("thyroid", "tsh", "الغدة", "درقية"), 6),
        (("cholesterol", "lipid", "lipids", "كوليسترول", "دهون"), 12),
        (("kidney", "creatinine", "egfr", "كلى"), 6),
        (("liver", "alt", "ast", "كبد"), 6),
        (("vitamin", "b12", "vitamin d", "فيتامين"), 6),
        (("hair loss", "تساقط الشعر", "alopecia"), 6),
        (("obesity", "weight gain", "سمنة", "وزن"), 6),
        (("underweight", "weight loss", "نحافة"), 3),
        (("anemia", "hemoglobin", "فقر الدم", "هيموغلوبين"), 3),
        (("pregnancy", "prenatal", "حمل"), 1),
        (("checkup", "annual", "routine", "فحص شامل"), 12),
        (("hormone", "هرمون"), 6),
        (("infection", "fever", "حمى", "عدوى"), 1),
    ]
    for keywords, months in rules:
        if any(k in c for k in keywords):
            return {"frequencyMonths": months}
    return {"frequencyMonths": 6}


def _premium_system_prompt(kind: str, audience: str, language: str) -> str:
    """Specialized prompts for premium analyses: microbiology culture & sensitivity and semen analysis."""
    lang_map = {
        "ar": "Arabic (العربية)", "en": "English", "fr": "French", "es": "Spanish",
        "de": "German", "tr": "Turkish", "ur": "Urdu", "hi": "Hindi", "zh": "Chinese",
        "ru": "Russian", "pt": "Portuguese", "it": "Italian", "ja": "Japanese",
        "ko": "Korean", "fa": "Persian",
    }
    language_name = lang_map.get(language, language)
    tone_specialist = audience == "specialist"

    if kind == "microbiology":
        domain = (
            "You are an expert clinical microbiologist. Read this CULTURE AND ANTIBIOTIC SENSITIVITY "
            "report carefully. Extract: (1) the specimen type, (2) organism(s) isolated and colony count, "
            "(3) Gram stain if reported, (4) the FULL antibiotic sensitivity panel with S / I / R for "
            "each agent, (5) resistance markers (MRSA, ESBL, CRE, VRE, etc.). Then interpret: clinical "
            "significance of the organism in this specimen, the most appropriate antibiotic choice based "
            "on the sensitivity panel (prefer narrow-spectrum, first-line, oral when possible), suggested "
            "duration, isolation / infection-control precautions, follow-up cultures."
        )
        sections = (
            "## Specimen & Organism\n"
            "## Sensitivity Panel\n"
            "(Bulleted list: antibiotic — S/I/R, with brief comment.)\n\n"
            "## Recommended Antibiotic\n"
            "(Pick the best agent based on the panel; include dose/route if commonly used, contraindications.)\n\n"
            "## Resistance Notes\n"
            "## Clinical Significance & Follow-up\n"
        )
    elif kind == "semen":
        domain = (
            "You are an expert andrologist / reproductive medicine consultant. Read this SEMEN ANALYSIS "
            "report carefully. Extract every parameter present: volume (mL), total count, concentration, "
            "total motility %, progressive motility %, morphology (% normal forms), vitality, pH, "
            "liquefaction time, WBCs, anti-sperm antibodies if present. Compare each parameter against "
            "WHO 6th edition (2021) lower reference limits. Identify any pattern: oligozoospermia, "
            "asthenozoospermia, teratozoospermia, oligoasthenoteratozoospermia (OAT), azoospermia, etc."
        )
        sections = (
            "## Parameters vs WHO Reference\n"
            "(Table-style bulleted list: parameter, value, WHO lower limit, status.)\n\n"
            "## Diagnostic Pattern\n"
            "## Possible Causes\n"
            "## Recommended Next Tests\n"
            "(Hormone profile FSH/LH/Testosterone/Prolactin, repeat semen analysis after 2-3 months, "
            "scrotal ultrasound if indicated, genetic testing if azoospermia.)\n"
        )
    elif kind == "histopathology":
        domain = (
            "You are an expert anatomic / surgical pathologist. Read this HISTOPATHOLOGY (tissue biopsy / "
            "surgical specimen) report carefully. Extract: (1) specimen type and site, (2) gross "
            "description, (3) microscopic description, (4) tumor type / grade / differentiation, "
            "(5) margins, (6) lymphovascular / perineural invasion, (7) lymph node status, "
            "(8) immunohistochemistry (IHC) markers and their pattern, (9) molecular markers if any, "
            "(10) TNM / AJCC stage if applicable, (11) final diagnosis. Then interpret clinical "
            "significance, prognostic implications, and standard next steps. Use precise pathology "
            "terminology; explain key terms in lay words for patients."
        )
        sections = (
            "## Specimen & Diagnosis\n"
            "## Histologic Features\n"
            "## Tumor Grade / Stage (if applicable)\n"
            "## Margins, LVI / PNI, Nodes\n"
            "## IHC & Molecular Markers\n"
            "(Bulleted list: marker — pattern (positive / negative / focal / strong) — clinical meaning.)\n\n"
            "## Prognostic & Clinical Significance\n"
            "## Recommended Next Steps\n"
            "(Multidisciplinary team referral, staging imaging, adjuvant therapy considerations, "
            "follow-up schedule, genetic counseling when relevant.)\n"
        )
    elif kind == "cytology":
        domain = (
            "You are an expert cytopathologist. Read this CYTOLOGY (cell-smear) report carefully — "
            "this may be a Pap smear, fine-needle aspiration (FNA), body fluid, urine, sputum, or other "
            "exfoliative cytology. Extract: (1) specimen type and site, (2) adequacy, (3) cellular "
            "composition, (4) cytologic features (nuclear atypia, hyperchromasia, pleomorphism, "
            "background), (5) classification system used (Bethesda for Pap; Milan for salivary; "
            "Paris for urine; Bethesda for thyroid; etc.), (6) final category / diagnosis, "
            "(7) any ancillary tests (HPV co-test, ICC, molecular). Then interpret risk of malignancy "
            "and standard follow-up."
        )
        sections = (
            "## Specimen & Adequacy\n"
            "## Cytologic Findings\n"
            "## Diagnostic Category\n"
            "(Quote the exact category from the classification system, e.g., 'Bethesda IV — Suspicious for "
            "Follicular Neoplasm'.)\n\n"
            "## Risk of Malignancy\n"
            "## Ancillary Tests\n"
            "## Recommended Next Steps\n"
            "(Repeat cytology / core biopsy / surgical excision / imaging / referral.)\n"
        )
    elif kind == "genetic":
        domain = (
            "You are an expert clinical / molecular geneticist. Read this GENETIC TEST report carefully — "
            "this may be a single-gene test, panel, exome / genome, pharmacogenomic, or carrier screen. "
            "Extract: (1) test type and methodology (Sanger, NGS, MLPA, qPCR, etc.), (2) genes / regions "
            "analyzed, (3) every variant detected with HGVS notation (e.g., c.1521_1523delCTT "
            "p.(Phe508del)), (4) zygosity, (5) ACMG classification (Pathogenic / Likely Pathogenic / VUS / "
            "Likely Benign / Benign), (6) inheritance pattern, (7) any positive / negative / inconclusive "
            "result, (8) allele frequency where reported. Then interpret clinical implications, "
            "penetrance, family-screening recommendations, and need for genetic counseling."
        )
        sections = (
            "## Test Methodology\n"
            "## Variants Detected\n"
            "(For each variant: gene, HGVS coding/protein, zygosity, ACMG class, clinical meaning.)\n\n"
            "## Clinical Interpretation\n"
            "## Inheritance & Family Screening\n"
            "## Genetic Counseling & Next Steps\n"
            "(Cascade testing, prenatal options, surveillance schedules, therapeutic implications.)\n"
        )
    elif kind == "karyotype":
        domain = (
            "You are an expert cytogeneticist. Read this CHROMOSOMAL / KARYOTYPE analysis report "
            "carefully — this may be a conventional karyotype (G-banding), FISH, chromosomal microarray "
            "(CMA / array CGH), or oncology cytogenetics. Extract: (1) test type, (2) tissue source, "
            "(3) banding resolution, (4) the full ISCN nomenclature result (e.g., 46,XX or 47,XY,+21 or "
            "46,XX,t(9;22)(q34;q11.2)), (5) number of cells analyzed, (6) every numerical or structural "
            "abnormality with its clinical name (Trisomy 21 / Down syndrome, Philadelphia chromosome / "
            "BCR-ABL1, etc.), (7) mosaicism if any. Then interpret the syndrome or hematologic / "
            "oncologic implication, prognosis, and confirmatory / family testing recommendations."
        )
        sections = (
            "## ISCN Result & Methodology\n"
            "## Chromosomal Abnormalities\n"
            "(For each abnormality: ISCN notation, clinical name, % cells if mosaic.)\n\n"
            "## Syndromic / Clinical Correlation\n"
            "## Prognostic / Therapeutic Implications\n"
            "## Confirmatory & Family Testing\n"
            "(FISH confirmation, parental karyotypes, prenatal diagnosis, MRD monitoring in oncology.)\n"
        )
    elif kind == "radiology":
        domain = (
            "You are an expert diagnostic radiologist with subspecialty fluency in ultrasound (sonar), "
            "X-ray (plain film), CT, and MRI. The user has uploaded a radiology image (or PDF report). "
            "If the input is an image: describe systematically — modality, body region, technique, "
            "visualization, every visible finding (location, size in mm/cm, density/echogenicity/signal, "
            "shape, margins), comparison if a prior is referenced. If the input is a written report, "
            "extract every finding listed. Then synthesize an impression with a ranked differential, "
            "ACR/PI-RADS/LI-RADS/BI-RADS/TI-RADS category if applicable, and clear next-step "
            "recommendations (follow-up imaging interval, biopsy, MDT, urgency). When findings could "
            "represent emergencies (pneumothorax, free air, large effusion, intracranial hemorrhage, "
            "aortic dissection, ectopic pregnancy, etc.) flag URGENT clearly at the top."
        )
        sections = (
            "## Modality & Technique\n"
            "## Systematic Findings\n"
            "(Bulleted list per organ/region — location, size, descriptors, significance.)\n\n"
            "## Impression & Differential\n"
            "## Reporting Category (if applicable)\n"
            "(BI-RADS / LI-RADS / PI-RADS / TI-RADS / Lung-RADS / O-RADS, with category number & meaning.)\n\n"
            "## Recommended Next Steps\n"
            "(Specific follow-up imaging modality + interval, biopsy, referral, urgency.)\n"
        )
    elif kind == "ecg":
        domain = (
            "You are an expert cardiologist / electrophysiologist. The user has uploaded an "
            "electrocardiogram (ECG / EKG) — typically a 12-lead strip image, but may be rhythm strip. "
            "Read systematically using the standard ECG approach: (1) Rate, (2) Rhythm (sinus vs other), "
            "(3) Axis, (4) Intervals (PR, QRS, QT, QTc using Bazett's formula), (5) P-wave morphology, "
            "(6) QRS morphology (bundle branch blocks, hypertrophy, pathologic Q-waves), "
            "(7) ST-segment (elevation/depression with leads), (8) T-wave changes, (9) U-waves. "
            "Identify rhythm abnormalities (AFib, SVT, block, etc.) and signs of ischemia / infarction."
        )
        sections = (
            "## ECG Interpretation Summary\n"
            "## Measurements & Intervals\n"
            "(Table: Rate, Rhythm, Axis, PR, QRS, QTc.)\n\n"
            "## Waveform Analysis\n"
            "## Clinical Impression\n"
            "## Recommended Next Steps\n"
            "(Cardiac enzymes, echo, Stress test, cardiology consult, repeat ECG interval.)\n"
        )
    else:
        return _system_prompt(audience, language)

    return (
        f"{domain}\n\n"
        f"Always respond ENTIRELY in {language_name}.\n\n"
        "==================== CRITICAL MEDICAL SAFETY GUARDRAILS ====================\n"
        "1. NEVER suggest or recommend the Oral Glucose Tolerance Test (OGTT) for diagnosed diabetics.\n"
        "2. URGENT FINDINGS: If findings indicate a medical emergency, state this CLEARLY at the top.\n"
        "============================================================================\n\n"
        f"{sections}\n"
        "## Important Disclaimer\n\n"
        "End with a clear disclaimer that this is informational only and not a substitute for a "
        "qualified physician's evaluation."
    )
