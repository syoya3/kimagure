# Tech campus: Meshy assets and motion

Generated with `meshy-cli@0.4.0` on 2026-09-29. This is an original city-builder-inspired scene; no Cities: Skylines assets are used.

## Runtime assets

All files live in `public/models/tech-campus/` and load from the same origin.

| File | Use |
| --- | --- |
| office.glb | Existing glass headquarters |
| nagi.glb | Receptionist: ponytail, cream blazer, teal blouse |
| miki.glb | Engineer: short black hair, glasses, navy overshirt; remeshed original |
| sora.glb | Designer: pink bob, beret, lavender cardigan, wide trousers |
| tsudoi.glb | Community manager: beard, olive cap, orange shirt, cargo trousers |
| taiju.glb | Founder: silver hair, glasses, charcoal suit |
| guest-walk.glb | Preserved earlier skinned visitor / walking clip |
| guest-run.glb | Preserved original bundled running clip for comparison |
| guest-run-fast.glb | Previous rig and Run Fast; motion reference for arm retargeting |
| guest-tpose-source.glb | Existing character prepared in T-pose for rerigging |
| guest-rerig-run.glb | New Meshy rig with Run Fast, unmodified service output |
| guest-rerig-run-retargeted.glb | Runtime visitor with corrected arm joint frames |
| guest-idle.glb | Retained original Meshy idle clip (not loaded at runtime) |
| guest.glb | Static fallback shown only while the animated files load or on a loader error |

NPCs are independently generated models, with different silhouettes and heights. Only the moving visitor is rigged; the five conversation NPCs remain stationary. New characters requested remeshing during generation (10,000 target faces, 12,000 for the visitor). The animated visitor has 12,471 triangles. Source models, JSON task snapshots and rendered previews are preserved in the ignored local folder `meshy_output/20260929_150643_tech-campus_01a0ebc5/`.

## Animation implementation

`AnimatedCitizen.tsx` loads `guest-rerig-run-retargeted.glb`, based on a fresh Meshy rig and the Run Fast preset (action 16, 0.5 s). The original generated character had bent elbows and upturned palms, rather than a straight A/T reference pose. `scripts/prepare-rig-source.mjs` straightens the existing arms into T-pose and bakes a textured, unskinned source without regenerating the person's design. Meshy then regenerates the skeleton and weights.

Automatic rerigging alone still produced outward arm motion. `scripts/retarget-rerig-arms.mjs` therefore maps the previous Run Fast's sagittal arm swing and elbow flexion into the new skeleton's joint frames offline. Clavicles stay at their bind orientation relative to the animated chest; upper arms stay beside the torso; forearms point forward/slightly inward; wrists align with forearms. It writes only the eight shoulder/arm/forearm/hand rotation tracks, plus a constant 3.65 cm pelvis lift to compensate the new clip's below-floor shoe motion. All other tracks, including legs, torso, head and timing, remain the Meshy export. This is a corrected retarget, not an unmodified Meshy preset. Runtime only blends the delivered clip with the neutral standing pose.

Measured planted-foot speed is approximately 3.68 source metres/sec; playback matches actual travel up to 5.2 world units/sec. The existing compact relaxed hand meshes remain attached to the hand bones. Moving meshes keep frustum culling disabled to avoid stale bind-pose bounds hiding the runner.

Rerigging task: `01a0ec2e-7877-7762-895d-45962bc7fd52` (`rigging`, 5 credits). Run Fast application: `01a0ec2f-8d60-7226-a49a-964bd578c413` (`animate`, 3 credits). Project: `meshy_output/20260929_150643_tech-campus_01a0ebc5`; stages `tpose-rerig`, `rerig-run-fast`, `rerig-run-delivery`. Total for this follow-up: **8 credits**; cumulative total: **234 credits**. Original service output SHA-256: `d22ccc0f8daf76b0c73dc18c8312ba3d995649ec06d4f3e595f735bbd113e982`. No new character generation was submitted. Final retargeted GLB SHA-256: `817a0548a3c2e131a918e1c4cc1db4c8fd4bcd15c5dea675467730eca0ffc305`. Local outputs and source preparation are retained for reproducibility.

`characterSurface.ts` shares smooth normals across duplicated UV vertices without changing UVs or skin weights. It disables the low-poly normal bake that exaggerated triangular face shading, removes metallic skin and softens roughness/ambient occlusion. All six people use this surface treatment. Softer daylight and a small local reflection map support the new materials without external HDR assets.

The previous Run Fast task was `01a0ec1f-b949-7326-9427-53dc6be076db` (`animate`, action 16), using existing rig `01a0ebd8-758d-75ab-96e1-851bac8bc3f1`. Project: `meshy_output/20260929_150643_tech-campus_01a0ebc5`, stages `run-fast-preset` and `run-fast-delivery`. Download: `public/models/tech-campus/guest-run-fast.glb`, SHA-256 `e2932103b0b3f4b579407bfa46479e6503e39b2f870f282045759edc049449a6`. Actual cost: **3 credits**, cumulative generation total **226 credits**. It was visually inspected from the front and side at multiple phases. No character regeneration was submitted.

Conversation switches smoothly to a chest-up frontal view of the selected NPC, adjusted for individual height and screen size. Name, role, dialogue progress and a conversation indicator identify the speaker. Exploration labels, the player and movement controls hide during the shot; finishing the conversation returns to the exploration camera. The five NPCs have been restored to the previous original face shapes: the later procedural smile, cheek/brow deformation, eyelid deformation and jaw/head morphs are removed from runtime. Soft surface shading and the conversation camera are retained.

The development canvas exposes read-only `data-character-motion`, `data-camera-mode`, `data-city-zoom`, `data-camera-pan` and `data-player-screen` diagnostics. These are omitted in production.

## Mouse camera control

Wheel/trackpad scroll moves between 0.48× and 4.8× camera distance. Wheel up moves closer; wheel down reveals the district. Left-button dragging horizontally pans the background in either direction. Starting movement releases the inspection pan and smoothly resumes full player tracking at every zoom. A screen-space guard keeps a moving player's centre inside the central safe area, including portrait viewports and transitions from a large pan. Conversation temporarily owns the camera and preserves exploration zoom. Two-finger pinch is supported on the canvas.

## New generation history

| Character | text-to-3d preview | text-to-3d refine | Credits |
| --- | --- | --- | --- |
| Visitor | 01a0ebd4-1a1b-72fe-ab76-b0faac939b72 | 01a0ebd5-518e-707d-8035-0d96883025dc | 30 |
| Nagi | 01a0ebd4-abc4-7532-95a1-5a3847dcc4e2 | 01a0ebd6-19b9-7375-89e8-0367327d2950 | 30 |
| Sora | 01a0ebd4-c02d-7127-a23c-97a158a18f9e | 01a0ebd6-2c1b-714f-9bc0-9efe54b13b33 | 30 |
| Tsudoi | 01a0ebd4-d290-767f-927b-c3e23b302c19 | 01a0ebd6-4b72-723c-a88b-45ea985b486d | 30 |
| Taiju | 01a0ebd4-e488-7436-b06f-c9a4f3528cec | 01a0ebd6-66de-710e-8bcd-d14bfa237a49 | 30 |

- Miki `remesh`: `01a0ebd4-5d42-74fe-9585-046fcb21fd5b` — 5 credits.
- Visitor `rigging`: `01a0ebd8-758d-75ab-96e1-851bac8bc3f1` — 5 credits; includes the walking GLB.
- Visitor `animate`, action 0 (Idle): `01a0ebdb-0952-7774-84b1-591039b57c13` — 3 credits.

**Actual cost for this revision: 163 credits.** Original generation cost: 60 credits. Cumulative: 223 credits.

Original office preview/refine: `01a0ebc5-9e34-7150-8ca2-b316bf46f96c` / `01a0ebc7-b042-7055-a240-655a7d58cff1`.
Original employee preview/refine: `01a0ebc5-f999-7696-aa9f-073bac13defe` / `01a0ebc8-ed9a-735a-a730-6ff01b7437da`.
Both original resources are `text-to-3d`. The office still uses the original dense 71 MB model. Its previously proposed additional remesh was not submitted; do not regenerate it to optimize it.

## Street environment

`UrbanBuildings.tsx` provides a cylindrical glass tower, bronze-fin tower, white lab, terraced office, brick coffee shop and stucco bistro, with shop signs, striped awnings, rooftop terraces and outdoor tables. `CityDetails.tsx` provides instanced leaf cards, branches, bark grain, wood-grain slatted benches with backs and metal frames, LED streetlights, cafe chairs/cups, bins and bollards. `RealisticCar.tsx` replaces block cars with beveled sedan/crossover bodies, wheel arches, separate glass panels, window pillars, metallic paint, head/tail lights, mirrors, door handles, grilles and rotating tires/alloy wheels. Traffic routes and continuous movement remain in place.

## Verification

- Company landmark: `GoalTree.tsx` makes only the tree behind Taiju golden, with individually shaded leaves, a soft canopy aura, rising sparkles and a slow ground ripple. The existing tree collider and conversation mechanics are retained. This uses procedural materials; no additional Meshy credits. Screenshot: `docs/tech-campus-golden-tree.png`.

- `node scripts/check-arm-rig.mjs`: samples a full cycle of both rigs. Previous outward forearm displacement reached 17.7 cm; the corrected version remains inward. Upper-arm lateral displacement falls from 13.9 cm to 1.5 cm. Shoulder/arm lengths remain constant, coincident skin vertices do not split, and non-arm preset tracks remain unchanged (apart from the documented pelvis clearance).
- `node scripts/check-character-running.mjs`: runtime clip fidelity to the delivered asset, arm swing behind/ahead of both shoulders, knee flexion/extension, flight and sole clearance.
- `node scripts/check-locomotion-transitions.mjs`: source-pose restoration, loop seam, continuous stop and stable idle; retained zoom and camera-follow checks.
- Browser inspection: T-pose input, new rig, corrected front/side poses at multiple phases, and running/stopping in the actual city.
- `npm run build`: passed compilation, lint/types and static generation after removing the temporary review route.
- Preview: `http://localhost:3100/`.
- Current corrected arms: `docs/tech-campus-arm-rerig-front.png`.
- Previous face restoration: `docs/tech-campus-restored-face.png`.
