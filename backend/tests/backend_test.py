"""Backend API tests for MediReader landing page.

Covers: health check, manual/image/pdf analysis (LLM), contact, newsletter, pricing.
"""
import io
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].splitlines()[0].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

LLM_TIMEOUT = 120


# ---------- Health ----------
def test_health_root():
    r = requests.get(f"{API}/", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("status") == "ok"
    assert "MediReader" in data.get("message", "")


# ---------- Pricing ----------
def test_pricing_returns_three_plans():
    r = requests.get(f"{API}/pricing", timeout=30)
    assert r.status_code == 200
    data = r.json()
    plans = data.get("plans")
    assert isinstance(plans, list) and len(plans) == 3
    ids = {p["id"] for p in plans}
    assert ids == {"free", "pro", "clinic"}
    for p in plans:
        assert "monthly_usd" in p and "features_count" in p


# ---------- Contact ----------
def test_contact_creates_record():
    payload = {
        "name": "TEST_user",
        "email": f"TEST_{uuid.uuid4().hex[:8]}@example.com",
        "message": "Hello from automated test",
    }
    r = requests.post(f"{API}/contact", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("ok") is True
    assert isinstance(data.get("id"), str) and len(data["id"]) > 0


def test_contact_invalid_email():
    r = requests.post(f"{API}/contact", json={"name": "x", "email": "not-email", "message": "m"}, timeout=30)
    assert r.status_code in (400, 422)


# ---------- Newsletter ----------
def test_newsletter_subscribe_and_duplicate():
    email = f"TEST_news_{uuid.uuid4().hex[:8]}@example.com"
    r1 = requests.post(f"{API}/newsletter", json={"email": email}, timeout=30)
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1.get("ok") is True
    assert d1.get("already_subscribed") is False

    # duplicate
    r2 = requests.post(f"{API}/newsletter", json={"email": email}, timeout=30)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2.get("ok") is True
    assert d2.get("already_subscribed") is True


# ---------- Manual Analyze (LLM) ----------
SAMPLE_TESTS = [
    {"name": "Glucose", "value": "95", "unit": "mg/dL", "ref_range": "70-100"},
    {"name": "Hemoglobin", "value": "13.5", "unit": "g/dL", "ref_range": "12-16"},
]


@pytest.mark.parametrize("audience,language", [("patient", "ar"), ("specialist", "en")])
def test_analyze_manual(audience, language):
    payload = {"tests": SAMPLE_TESTS, "audience": audience, "language": language}
    r = requests.post(f"{API}/analyze/manual", json=payload, timeout=LLM_TIMEOUT)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data.get("id"), str)
    interp = data.get("interpretation", "")
    assert isinstance(interp, str) and len(interp) > 50, f"too short: {interp!r}"
    assert "timestamp" in data


def test_analyze_manual_empty_tests():
    r = requests.post(f"{API}/analyze/manual", json={"tests": [], "audience": "patient", "language": "en"}, timeout=30)
    assert r.status_code == 400


# ---------- Image Analyze (LLM) ----------
def _make_test_image_png():
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (700, 320), color="white")
    d = ImageDraw.Draw(img)
    text = (
        "Lab Test Results\n"
        "Glucose: 95 mg/dL  (ref 70-100)\n"
        "Hemoglobin: 13.5 g/dL  (ref 12-16)\n"
        "WBC: 7.2 x10^9/L  (ref 4-11)"
    )
    d.multiline_text((10, 10), text, fill="black", spacing=8)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def test_analyze_image():
    buf = _make_test_image_png()
    files = {"file": ("labs.png", buf, "image/png")}
    data = {"audience": "patient", "language": "en"}
    r = requests.post(f"{API}/analyze/image", files=files, data=data, timeout=LLM_TIMEOUT)
    assert r.status_code == 200, r.text
    j = r.json()
    assert isinstance(j.get("interpretation"), str) and len(j["interpretation"]) > 50


def test_analyze_image_rejects_non_image():
    files = {"file": ("notes.txt", io.BytesIO(b"hello"), "text/plain")}
    r = requests.post(f"{API}/analyze/image", files=files, data={"audience": "patient", "language": "en"}, timeout=30)
    assert r.status_code == 400


# ---------- PDF Analyze (LLM) ----------
def _make_test_pdf():
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
    except ImportError:
        pytest.skip("reportlab not installed")
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.setFont("Helvetica", 12)
    y = 750
    for line in [
        "Lab Report - Patient TEST",
        "Glucose: 95 mg/dL  (ref 70-100)",
        "Hemoglobin: 13.5 g/dL  (ref 12-16)",
        "WBC: 7.2 x10^9/L  (ref 4-11)",
        "Cholesterol: 210 mg/dL  (ref <200)",
    ]:
        c.drawString(60, y, line)
        y -= 20
    c.showPage()
    c.save()
    buf.seek(0)
    return buf


def test_analyze_pdf():
    buf = _make_test_pdf()
    files = {"file": ("labs.pdf", buf, "application/pdf")}
    data = {"audience": "specialist", "language": "ar"}
    r = requests.post(f"{API}/analyze/pdf", files=files, data=data, timeout=LLM_TIMEOUT)
    assert r.status_code == 200, r.text
    j = r.json()
    assert isinstance(j.get("interpretation"), str) and len(j["interpretation"]) > 50


def test_analyze_pdf_rejects_non_pdf():
    files = {"file": ("img.png", io.BytesIO(b"\x89PNG\r\n"), "image/png")}
    r = requests.post(f"{API}/analyze/pdf", files=files, data={"audience": "patient", "language": "en"}, timeout=30)
    assert r.status_code == 400
