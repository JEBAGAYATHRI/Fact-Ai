"""
Firebase Admin SDK integration.

After our own custom OTP (services/email_otp.py) verifies that someone
really owns an email address, this module asks Firebase to issue a
real login token for that email - so the frontend can actually sign
the person into Firebase, not just show a "verified" message.

Requires a service account key file at:
    backend/firebase-service-account.json
"""

import os
import firebase_admin
from firebase_admin import credentials, auth as fb_auth

_SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "firebase-service-account.json",
)

_initialized = False


def _ensure_initialized():
    global _initialized
    if _initialized:
        return
    if not os.path.exists(_SERVICE_ACCOUNT_PATH):
        raise ValueError(
            "firebase-service-account.json not found in the backend folder. "
            "Download it from Firebase Console -> Project Settings -> Service accounts."
        )
    cred = credentials.Certificate(_SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    _initialized = True


def mint_login_token_for_email(email: str) -> str:
    _ensure_initialized()

    try:
        user = fb_auth.get_user_by_email(email)
    except fb_auth.UserNotFoundError:
        user = fb_auth.create_user(email=email)

    token = fb_auth.create_custom_token(user.uid)
    return token.decode("utf-8") if isinstance(token, bytes) else token