#!/usr/bin/env python3
"""Generate one English TTS voice draft via Google Gemini REST Interactions API.

Requires GEMINI_API_KEY in the execution environment. Never put it in GitHub,
ChatGPT messages, browser JavaScript, or Google Sheets. No paid tier needed if
an eligible Free Tier Gemini project actually has quota; the owner MUST verify
billing state first. This script never changes a billing tier and never calls
Cloud Run, Supabase, or Google Drive. It refuses to overwrite existing outputs.

Run (dry-run only):
 python generate_gemini_s01_trial.py --dry-run
Run (only with authorized Gemini Free Tier account and API key):
 GEMINI_API_KEY=... python generate_gemini_s01_trial.py --out /private/draft_s01.wav
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import urllib.error
import urllib.request
import wave

ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions"
MODEL = "gemini-3.1-flash-tts-preview"  # Validated against official TTS REST example
VOICE = "Kore"
SCENE_ID = "STORY-EN-001-S01"
SPEECH = "One evening, Lumi the firefly saw a little bunny crying in the forest."
GUIDANCE = (
    "Speak as a warm and gentle American English narrator for primary-school "
    "children learning English. Read at an unhurried, natural pace, with "
    "a small pause after 'evening'. Pronounce Lumi 'LOO-mee'. "
    "Say the text after the colon exactly once, without extra words: "
)


def make_payload(model: str = MODEL, voice: str = VOICE) -> dict:
    return {
        "model": model,
        "input": GUIDANCE + SPEECH,
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voice}]},
    }


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--model", default=MODEL)
    p.add_argument("--voice", default=VOICE)
    p.add_argument("--out", type=Path, default=Path("STORY-EN-001_S01_VOICE_DRAFT_GEMINI_v1.wav"))
    args = p.parse_args()
    payload = make_payload(args.model, args.voice)
    if args.dry_run:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        print("DRY_RUN_ONLY — no request and no audio created")
        return 0

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise SystemExit("GEMINI_API_KEY not provided by authorized server environment; no request sent")
    if args.out.exists():
        raise SystemExit("Refusing to overwrite existing draft; choose a new output path")
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            result = json.loads(res.read())
    except urllib.error.HTTPError as exc:
        # Avoid leaking request headers, API keys, or response internals.
        raise SystemExit(f"Gemini TTS request rejected (HTTP {exc.code}); verify model access and Free Tier quotas")
    except urllib.error.URLError:
        raise SystemExit("Unable to contact Gemini API; no audio created")
    audio_b64 = (result.get("output_audio") or {}).get("data")
    if not audio_b64:
        raise SystemExit("No output_audio.data returned; no file created")
    pcm = base64.b64decode(audio_b64, validate=True)
    if len(pcm) < 24000:
        raise SystemExit("Audio unexpectedly short; file not saved")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(args.out), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)
        wf.writeframes(pcm)
    duration = len(pcm) / (24000 * 2)
    manifest = {
        "scene_id": SCENE_ID, "script_revision": "v1", "status": "DRAFT_NOT_APPROVED",
        "model": args.model, "voice": args.voice,
        "duration_seconds": round(duration, 3), "scene_budget_seconds": 8.0,
        "fits_budget": duration <= 7.6, "language": "en-US",
        "sha256": hashlib.sha256(args.out.read_bytes()).hexdigest(),
        "bytes": args.out.stat().st_size,
        "qa": "REQUIRES_HUMAN_LISTENING", "paid_tier": "NOT_ASSERTED",
    }
    dest = args.out.with_suffix(".json")
    dest.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"output": str(args.out), **manifest}, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
