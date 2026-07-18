from typing import List, Dict
from ddgs import DDGS


def search_web(query: str, max_results: int = 5) -> List[Dict]:
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "title": r.get("title", "").strip(),
                    "snippet": r.get("body", "").strip(),
                    "url": r.get("href", "").strip(),
                })
    except Exception as e:
        print(f"[search_web] error: {e}")
    return results
