"""
OCR service using OCR.space's free hosted API.

We use a hosted API instead of local Tesseract to avoid requiring a
separate program install + PATH configuration on the user's machine.

Free tier: https://ocr.space/ocrapi/freekey
"""

import os
import requests

OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image"


def extract_text_from_image(image_bytes: bytes, filename: str = "upload.jpg", language: str = "eng") -> str:
    """
    Sends image bytes to OCR.space and returns the extracted text.
    Raises a ValueError with a clear message if it fails.

    language: "eng" or "tam" (Tamil).
    Engine 2 has better accuracy on noisy/social-media screenshots but only
    supports a limited set of languages (no Tamil), so we fall back to
    Engine 1 for Tamil.
    """
    api_key = os.getenv("OCR_SPACE_API_KEY", "").strip()
    if not api_key:
        raise ValueError("OCR_SPACE_API_KEY is not set in .env")

    ocr_engine = 1 if language == "tam" else 2

    files = {"file": (filename, image_bytes)}
    data = {
        "apikey": api_key,
        "language": language,
        "isOverlayRequired": False,
        "OCREngine": ocr_engine,
    }

    try:
        resp = requests.post(OCR_SPACE_ENDPOINT, files=files, data=data, timeout=30)
        resp.raise_for_status()
        result = resp.json()
    except Exception as e:
        raise ValueError(f"Could not reach OCR service: {e}")

    if result.get("IsErroredOnProcessing"):
        error_msg = result.get("ErrorMessage", ["Unknown OCR error"])
        raise ValueError(f"OCR failed: {error_msg}")

    parsed_results = result.get("ParsedResults", [])
    if not parsed_results:
        raise ValueError("No text could be extracted from this image.")

    text = parsed_results[0].get("ParsedText", "").strip()
    if not text:
        raise ValueError("No readable text was found in this image.")

    return text