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
GROQ_MODEL = "llama-3.3-70b-versatile"


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

EXPLANATION STYLE: Do NOT write a short 2-4 sentence answer. Write a detailed,
well-structured explanation, similar to a thorough analyst's report. Use
**bold section headings** (using two asterisks around each heading, like
**What the evidence shows**) so the structure is clear, followed by the
content for that section on the next line. Include these sections in order:

**Verdict** - one short line stating the verdict plainly.
**What the evidence shows** - a breakdown of the key facts found in the
search results and fact-check matches, referencing what different sources say.
**Why this matters** - any nuance, common misconceptions, or related context
that helps the reader understand the bigger picture.
**Summary** - a concise closing line.

Separate each heading and its content, and each section from the next, with
blank lines (\\n\\n) so they read as clear paragraphs. Aim for genuine depth
and usefulness, not padding - every sentence should add real information.
If the evidence is thin, be honest about that limitation rather than
inventing detail.

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