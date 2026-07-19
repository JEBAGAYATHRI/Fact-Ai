"""
LLM reasoning layer using Groq's free API.

Takes the claim + evidence gathered in Day 1 (web search + fact-check matches)
and asks the LLM to reason over it, returning a structured verdict instead
of raw search results.

We do NOT ask the LLM to fact-check from memory. We only ask it to reason
over the evidence we already retrieved. This avoids hallucination.
"""

import os
import json
import re
from typing import List, Dict
import requests

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"  # free tier model on Groq


def build_prompt(claim: str, web_evidence: List[Dict], fact_check_matches: List[Dict], reply_language: str = "auto") -> str:
    evidence_text = ""

    if fact_check_matches:
        evidence_text += "PROFESSIONAL FACT-CHECKS FOUND:\n"
        for i, fc in enumerate(fact_check_matches, 1):
            evidence_text += (
                f"{i}. Publisher: {fc.get('publisher')}, "
                f"Rating: {fc.get('rating')}, "
                f"Claim reviewed: {fc.get('claim_text')}\n"
            )

    if web_evidence:
        evidence_text += "\nWEB SEARCH RESULTS:\n"
        for i, ev in enumerate(web_evidence, 1):
            evidence_text += (
                f"{i}. Title: {ev.get('title')}\n"
                f"   Snippet: {ev.get('snippet')}\n"
                f"   URL: {ev.get('url')}\n"
            )

    if not evidence_text:
        evidence_text = "No evidence was found from search or fact-check databases."

    if reply_language == "ta":
        language_instruction = 'Write your "explanation" field entirely in Tamil, regardless of what language the claim below is written in.'
    elif reply_language == "en":
        language_instruction = 'Write your "explanation" field entirely in English, regardless of what language the claim below is written in.'
    else:
        language_instruction = 'Detect the language of the CLAIM below. If it is written in Tamil (Tamil script), write your "explanation" field entirely in Tamil. If it is written in English, write your "explanation" field entirely in English.'

    prompt = f"""You are a fact-checking assistant. Your job is to evaluate a claim
using ONLY the evidence provided below. Do not use any outside knowledge.
If the evidence is insufficient or contradictory, say so honestly.

LANGUAGE INSTRUCTION: {language_instruction}
Keep "verdict" as one of the exact English words listed below regardless of
the reply language, since the app uses that field to pick a color/icon.

EXPLANATION STYLE: Do NOT write a short 2-4 sentence answer, and do NOT
restate the verdict itself (that's already shown separately). Write a
detailed explanation broken into exactly these four sections, in this
order, each starting with the exact bolded heading shown (two asterisks
around each heading, nothing else on that line):

**Key Evidence**
2-4 sentences on the strongest facts found in the search results and
fact-check matches, referencing what different sources say.

**Missing Evidence**
1-3 sentences on what's NOT confirmed, contradictory, or still uncertain.
If the evidence is fully conclusive either way, say so honestly here
instead of inventing a gap.

**Why It Matters**
1-3 sentences of context, common misconceptions, or bigger-picture
relevance for the reader.

**Final Summary**
One concise closing line.

Separate each heading from its body text, and each section from the next,
with blank lines (\\n\\n) so they read as clear paragraphs. Use **bold**
around specific important keywords or facts within the body text too,
not just the section headings. Aim for genuine depth and usefulness, not
padding - every sentence should add real information.

CLAIM TO EVALUATE:
"{claim}"

EVIDENCE:
{evidence_text}

Respond with ONLY a valid JSON object (no code fences wrapping the whole
response, no extra text outside the JSON). IMPORTANT: this must be valid
JSON - any line breaks inside the "explanation" text must be written as the
two characters backslash-n (\\n), NOT as an actual line break, or the
response will fail to parse. The **bold headings** described above belong
inside the "explanation" string value itself - that is fine and expected:

{{
  "verdict": "True" | "False" | "Misleading" | "Unverified",
  "confidence": <integer 0-100>,
  "explanation": "<the four-section explanation described above: **Key Evidence**, **Missing Evidence**, **Why It Matters**, **Final Summary**, using \\n\\n between sections>",
  "sources": ["<url1>", "<url2>", ...]
}}
"""
    return prompt


def get_verdict(claim: str, web_evidence: List[Dict], fact_check_matches: List[Dict], reply_language: str = "auto") -> Dict:
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    if not api_key:
        return {
            "verdict": "Unverified",
            "confidence": 0,
            "explanation": "GROQ_API_KEY is not set, so no AI reasoning was performed.",
            "sources": [],
        }

    prompt = build_prompt(claim, web_evidence, fact_check_matches, reply_language)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 1200,
    }

    try:
        resp = requests.post(GROQ_ENDPOINT, headers=headers, json=body, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["choices"][0]["message"]["content"].strip()

        # Strip accidental markdown code fences if the model adds them
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")
            if raw_text.lower().startswith("json"):
                raw_text = raw_text[4:].strip()

        parsed = json.loads(raw_text)
        return parsed

    except json.JSONDecodeError:
        # Common failure: the model put real line breaks inside the
        # "explanation" string instead of escaped \n. Try to repair by
        # escaping stray newlines that are inside string values, then
        # parse again before giving up.
        try:
            repaired = re.sub(r'(?<!\\)\n', r'\\n', raw_text)
            parsed = json.loads(repaired)
            return parsed
        except Exception as e2:
            return {
                "verdict": "Unverified",
                "confidence": 0,
                "explanation": f"The AI response could not be parsed as JSON: {e2}",
                "sources": [],
            }
    except Exception as e:
        return {
            "verdict": "Unverified",
            "confidence": 0,
            "explanation": f"Error calling Groq API: {e}",
            "sources": [],
        }