#!/usr/bin/env python3
"""Generate unapproved local English TTS WAV drafts, scene by scene.

This tool never approves a voice or marks a video delivered. The input is a
reviewed export of the Google Sheet, *not* an independently editable script.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_export(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not data.get("story_id") or not data.get("script_revision"):
        raise ValueError("story_id/script_revision required")
    source = data.get("source", {})
    if not source.get("spreadsheet_id") or not source.get("range"):
        raise ValueError("Google Sheet source spreadsheet_id/range required")
    scenes = data.get("scenes")
    if not isinstance(scenes, list) or not scenes or len(scenes) > 12:
        raise ValueError("Expected 1-12 scenes")
    ids = set()
    for item in scenes:
        if not item.get("scene_id") or item["scene_id"] in ids:
            raise ValueError("Missing or duplicate scene_id")
        ids.add(item["scene_id"])
        text = item.get("narration", "").strip()
        if not text or len(text) > 1200:
            raise ValueError(f"Invalid narration in {item['scene_id']}")
        duration = item.get("duration_seconds")
        if not isinstance(duration, (float, int)) or not 1 <= duration <= 180:
            raise ValueError(f"Invalid duration in {item['scene_id']}")
    return data


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--sheet-export", type=Path, required=True,
                   help="JSON snapshot exported from the exact approved Google Sheet revision")
    p.add_argument("--model", type=Path, default=Path("models/kokoro-v1.0.onnx"))
    p.add_argument("--voices", type=Path, default=Path("models/voices-v1.0.bin"))
    p.add_argument("--voice", default="af_sarah")
    p.add_argument("--speed", type=float, default=1.0)
    p.add_argument("--out-dir", type=Path, default=Path("output/voice_draft_kokoro_v1"))
    p.add_argument("--dry-run", action="store_true", help="Validate script without using TTS")
    args = p.parse_args()

    if not 0.7 <= args.speed <= 1.2:
        p.error("Speed must be 0.7–1.2; do not over-speed children's narration")
    data = read_export(args.sheet_export)
    script_hash = sha256(args.sheet_export)
    print(f"Story {data['story_id']} revision {data['script_revision']}")
    print(f"Source Sheet {data['source']['spreadsheet_id']} range {data['source']['range']}")
    print(f"Script export SHA-256 {script_hash}")
    print(f"Scenes {len(data['scenes'])}, voice {args.voice}, speed {args.speed}")
    for item in data["scenes"]:
        print(f"  {item['scene_id']} ({item['duration_seconds']}s): {item['narration']}")
    if args.dry_run:
        print("DRY_RUN_ONLY: no model loaded, no voice files generated, no QA passed")
        return 0

    if not args.model.is_file() or not args.voices.is_file():
        p.error("Kokoro model/voices files missing; see docs/FREE_TTS_DECISION_20261122.md")
    if args.out_dir.exists() and list(args.out_dir.glob("*.wav")):
        p.error("Output folder already contains WAV files; use a NEW versioned directory")
    try:
        from kokoro_onnx import Kokoro
        import soundfile as sf
    except ImportError as exc:
        p.error("Install dependencies: python -m pip install kokoro-onnx soundfile")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(args.model), str(args.voices))
    results = []
    for item in data["scenes"]:
        samples, rate = kokoro.create(item["narration"], voice=args.voice,
                                      speed=args.speed, lang="en-us")
        if not 8000 <= rate <= 96000 or samples.size == 0:
            raise RuntimeError(f"No valid audio for {item['scene_id']}")
        if not all(math.isfinite(float(x)) for x in samples.ravel()):
            raise RuntimeError(f"Non-finite waveform in {item['scene_id']}")
        name = f"{item['scene_id']}_VOICE_DRAFT_KOKORO_v1.wav"
        dest = args.out_dir / name
        sf.write(dest, samples, rate, subtype="PCM_16")
        duration = samples.shape[0] / rate
        max_duration = float(item["duration_seconds"])
        results.append({
            "scene_id": item["scene_id"], "file": name,
            "duration_seconds": round(duration, 3), "scene_budget_seconds": max_duration,
            "fits_scene": duration <= max_duration - 0.4,
            "sha256": sha256(dest), "bytes": dest.stat().st_size,
        })
        print(f"DRAFT {name} {duration:.2f}s; fits scene: {results[-1]['fits_scene']}")
    manifest = {
        "story_id": data["story_id"], "script_revision": data["script_revision"],
        "script_export_sha256": script_hash,
        "status": "DRAFT_NOT_APPROVED", "voice_qa": "PENDING_HUMAN_LISTENING",
        "model": "Kokoro-82M", "model_license": "Apache-2.0",
        "runtime": "kokoro-onnx", "runtime_license": "MIT",
        "voice": args.voice, "speed": args.speed, "language": "en-us",
        "files": results,
        "warning": "Do not mark VoiceApproved/Delivered. Verify pronunciation, rights and timing; scene budgets must be rechecked.",
    }
    (args.out_dir / "VOICE_DRAFT_MANIFEST.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("DRAFT_OUTPUTS_ONLY: requires human listening/approval")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
