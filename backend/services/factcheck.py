import os
from typing import List, Dict
import requests

GOOGLE_FACT_CHECK_ENDPOINT = "https://factchecktools.googleapis.com/v1alpha1/claims:search"


def search_fact_checks(query: str, max_results: int = 5) -> List[Dict]:
    api_key = os.getenv("GOOGLE_FACT_CHECK_API_KEY", "").strip()
    if not api_key:
        return []

    params = {"query": query, "key": api_key, "languageCode": "en"}

    try:
        resp = requests.get(GOOGLE_FACT_CHECK_ENDPOINT, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"[search_fact_checks] error: {e}")
        return []

    claims = data.get("claims", [])[:max_results]
    results = []
    for c in claims:
        review = (c.get("claimReview") or [{}])[0]
        results.append({
            "claim_text": c.get("text", ""),
            "publisher": review.get("publisher", {}).get("name", "Unknown"),
            "rating": review.get("textualRating", "Unknown"),
            "url": review.get("url", ""),
        })
    return results
