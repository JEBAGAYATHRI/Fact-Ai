"""
Fact-AI backend - Day 4

Adds image upload support: an image goes through OCR to extract text,
then that text is run through the exact same evidence + verdict
pipeline as a normal text claim. Also adds Tamil/English language support.
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.search import search_web
from services.factcheck import search_fact_checks
from services.llm import get_verdict
from services.ocr import extract_text_from_image
from services.email_otp import generate_and_send_otp, verify_otp
from services.firebase_admin_login import mint_login_token_for_email

load_dotenv()

app = FastAPI(title="Fact-AI API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimRequest(BaseModel):
    claim: str
class EmailRequest(BaseModel):
    email: str


class OtpVerifyRequest(BaseModel):
    email: str
    code: str


def run_pipeline(claim: str) -> dict:
    fact_check_matches = search_fact_checks(claim)
    web_evidence = search_web(claim)
    verdict = get_verdict(claim, web_evidence, fact_check_matches)

    return {
        "claim": claim,
        "verdict": verdict.get("verdict"),
        "confidence": verdict.get("confidence"),
        "explanation": verdict.get("explanation"),
        "sources": verdict.get("sources", []),
        "raw_evidence": {
            "fact_check_matches": fact_check_matches,
            "web_evidence": web_evidence,
        },
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/check")
def check_claim(request: ClaimRequest):
    claim = request.claim.strip()
    if not claim:
        return {"error": "Claim cannot be empty."}
    return run_pipeline(claim)


@app.post("/check-image")
async def check_image(file: UploadFile = File(...), language: str = Form("eng")):
    image_bytes = await file.read()

    try:
        extracted_text = extract_text_from_image(
            image_bytes, filename=file.filename, language=language
        )
    except ValueError as e:
        return {"error": str(e)}

    result = run_pipeline(extracted_text)
    result["extracted_text"] = extracted_text
    return result
@app.post("/send-otp")
def send_otp(request: EmailRequest):
    email = request.email.strip()
    if not email:
        return {"error": "Email cannot be empty."}
    try:
        generate_and_send_otp(email)
    except ValueError as e:
        return {"error": str(e)}
    return {"sent": True}


@app.post("/verify-otp")
def verify_otp_endpoint(request: OtpVerifyRequest):
    is_valid = verify_otp(request.email.strip(), request.code.strip())
    return {"verified": is_valid}
@app.post("/otp-login")
def otp_login(request: OtpVerifyRequest):
    email = request.email.strip()
    code = request.code.strip()

    if not verify_otp(email, code):
        return {"error": "Incorrect or expired code."}

    try:
        token = mint_login_token_for_email(email)
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Could not create login token: {e}"}

    return {"token": token}