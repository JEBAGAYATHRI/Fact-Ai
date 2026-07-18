"""
OTP email service using Gmail SMTP.

Generates a random 6-digit code, emails it via your own Gmail account
(using an App Password, not your normal password), and keeps track of
issued codes in memory so they can be verified later.

Includes a simple cooldown so the same email can't be spammed with
repeated OTP requests.
"""

import os
import random
import smtplib
import time
from email.mime.text import MIMEText

_otp_store = {}

OTP_EXPIRY_SECONDS = 5 * 60  # 5 minutes
COOLDOWN_SECONDS = 60  # must wait 60s between requests for the same email


def generate_and_send_otp(to_email: str) -> None:
    gmail_address = os.getenv("GMAIL_ADDRESS", "").strip()
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD", "").strip()

    if not gmail_address or not gmail_app_password:
        raise ValueError("GMAIL_ADDRESS or GMAIL_APP_PASSWORD is not set in .env")

    existing = _otp_store.get(to_email)
    if existing and time.time() - existing.get("last_sent", 0) < COOLDOWN_SECONDS:
        wait_left = int(COOLDOWN_SECONDS - (time.time() - existing["last_sent"]))
        raise ValueError(f"Please wait {wait_left}s before requesting another code.")

    code = f"{random.randint(0, 999999):06d}"
    _otp_store[to_email] = {
        "code": code,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
        "last_sent": time.time(),
    }

    subject = "Your Fact-AI verification code"
    body = f"Your verification code is: {code}\n\nThis code expires in 5 minutes."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = gmail_address
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(gmail_address, gmail_app_password)
            server.sendmail(gmail_address, [to_email], msg.as_string())
    except Exception as e:
        raise ValueError(f"Could not send OTP email: {e}")


def verify_otp(email: str, code: str) -> bool:
    record = _otp_store.get(email)
    if not record:
        return False

    if time.time() > record["expires_at"]:
        del _otp_store[email]
        return False

    is_valid = record["code"] == code.strip()
    if is_valid:
        del _otp_store[email]

    return is_valid