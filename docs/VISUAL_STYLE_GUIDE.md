# Visual Style Guide — Story Motion Studio v1.0
Date: 2026-11-22 | Applies initially to STORY-EN-001.

## Style objective
Character-led English children's bedtime-story / educational motion graphics. Readable, emotionally clear, visually consistent, safe for mobile 9:16, with midnight blue and warm golden-yellow highlights. Reference: [six v1 visual drafts](https://drive.google.com/drive/folders/1Des_VC-5FYDMLPXcN9tRESIQRRBX8b_k).

## Character manifest (draft style reference)
- **Lumi**: small friendly glowing golden firefly, rounded head, warm amber abdomen, two luminous antennae, translucent blue-white wings; kind, expressive face; always smaller than Ben.
- **Ben**: young small white rabbit, large pink inner ears, large brown eyes, pink nose, fluffy body, blue dungarees/overalls with gold buttons. Keep exactly the same outfit and age/proportions across all scenes.
- Establish a **canonical character model sheet** (front/side/3/4, happy, anxious, walking, flying) before serious animation: these are just scene illustrations, not animation-ready separated layers. Do not claim perfect consistency.

## Scene art specifications
- Source images: PNG RGB 941 × 1672 px (near 9:16).
- Output target: 1080 × 1920 px with centered composition and any necessary resampling/cropping checked visually.
- No text baked into image assets; title/captions rendered on separate video layer.
- Leave lower 18–22% clear of faces/hands/detail for readable subtitles; plan top safe area for platform UI.
- Dynamic action per scene; prevent consecutive scenes from becoming the same camera angle.
- Color rule: deep moonlit forest blues + warm yellow glows, white rabbit / blue overalls, soft contrast; avoid oversaturation and photorealistic textures.
- Motion: use safe Ken Burns/parallax for draft previsualization; real character-led animation requires separated transparent layers/pose assets, eye-blinks, head/arm/wings loops; avoid pretending pan/zoom alone is character animation.
- Scene 1 / 2: camera changes need extra QA because similar compositions.
- Scene 5 / 6: ensure a distinct closing beat so ending does not repeat the homecoming frame.

## Visual QA gate
- Verify six independent scenes and correct story sequencing.
- Confirm characters, outfits, props, and location continuity.
- Verify all image asset IDs resolve in the correct Drive story folder.
- Check all safety/legibility for future subtitles.
- Human reviewer must mark each scene `Approved` or `NeedsRevision` in Google Sheet; until then all files stay in `02_scene_images_draft`. Approved images may be copied into `03_scene_images_approved` in a later task.
- Any edited scene creates a new visual version; no overwriting an already approved image.

## Image provenance and rights
Generated as a new original fictional story illustration set. Rights and final publication usage still require normal QA. Public GitHub stores metadata; files live in Google Drive. No student data.
