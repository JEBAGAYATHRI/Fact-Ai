"""
Firebase Admin SDK integration.

After our own custom OTP (services/email_otp.py) verifies that someone
really owns an email address, this module asks Firebase to issue a
real login token for that email - so the frontend can actually sign
the person into Firebase, not just show a "verified" message.

Locally, this reads the service account key from:
    backend/firebase-service-account.json
(downloaded from Firebase Console -> Project Settings -> Service accounts)

On a hosting platform like Render, that file won't exist (it's gitignored
for security), so instead we read the same JSON content from an
environment variable called FIREBASE_SERVICE_ACCOUNT_JSON, which you paste
the file's full contents into via Render's dashboard.

This credential must NEVER be committed to git or shared publicly - it
grants full admin access to your Firebase project.
"""

import os
import json
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

    env_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()

    if env_json:
        cred_dict = json.loads(env_json)
        cred = credentials.Certificate(cred_dict)
    elif os.path.exists(_SERVICE_ACCOUNT_PATH):
        cred = credentials.Certificate(_SERVICE_ACCOUNT_PATH)
    else:
        raise ValueError(
            "No Firebase credential found. Locally, place "
            "firebase-service-account.json in the backend folder. On a "
            "hosting platform, set the FIREBASE_SERVICE_ACCOUNT_JSON "
            "environment variable to the file's full contents."
        )

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