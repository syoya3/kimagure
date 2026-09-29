# Sustained mobile rendering

The original headquarters alone contains 2,068,896 triangles. The seven runtime
models total 129,359,788 bytes, with 19 embedded images (352 MiB when represented
as RGBA pixels, before mipmaps; this is an asset estimate, not measured GPU RAM).
The former canvas rendered continuously at display refresh rate, with a fresh
2048px shadow map every frame. This is substantial sustained GPU work even while
the player is standing still. iPhone thermal throttling is a plausible contributor
to the reported gradual slowdown, but has not been measured on physical hardware.

## Changes

- Touch/coarse-pointer devices select the mobile tier once per canvas lifetime.
  Rotation does not fetch a second set of models. Desktop assets remain unchanged.
- `scripts/build-mobile-assets.mjs` creates seven local GLBs (13,124,596 bytes,
  89.9% smaller). Headquarters: 99,974 triangles, preserving its UV texture and
  silhouette. All character geometry, skeletons and animation accessors remain
  byte-for-byte unchanged. Image dimensions are at most 1024px; unused character
  normal/roughness/occlusion images are omitted. The resulting nine images total
  36 MiB as RGBA pixels, before mipmaps.
- The canvas renders at up to 30 fps on touch devices and 60 fps on desktop,
  independently of a 60/90/120 Hz display. All motion remains time-based. Rendering
  stops when the document is hidden and resumes without a large clock jump.
- Mobile starts at 1.25 DPR without MSAA. Sustained performance below 24 fps lowers
  DPR toward 0.85, after a startup grace period. Quality only decreases within a
  session to avoid repeated resolution oscillations.
- Mobile static shadows use 1024px maps and update on model arrival, not every
  frame. Cars/player use lightweight ground shadows, so cached shadows never leave
  behind a moving silhouette. Trees use fewer leaf cards and cars omit tiny wheel
  spokes/inside rim details. The golden goal tree and its glow remain.
- The animated rig releases its owned geometry/materials/bone texture on unmount.
  Mobile no longer downloads a separate full-size guest as a loading placeholder.
  Collision geometry is prepared once instead of allocating it for each movement
  frame.

## Verification

- `node scripts/check-mobile-performance.mjs`: passes 30 fps pacing simulations at
  60/90/120 Hz, adaptive DPR bounds, GLB buffer/index validity, image dimensions,
  byte-for-byte character accessor preservation and download budget.
- Existing running and camera/locomotion transition checks pass.
- ESLint, TypeScript and `npm run build` pass. Mobile conversation close-up is
  visually checked; screenshot of the normal mobile city is in
  `mobile-performance-preview.png`.
- A temporary 180-second movement test in a 390×844 desktop browser viewport,
  using the mobile profile, held about 30 fps at DPR 1.25. The sampled texture
  count stayed at 98. Geometry count rose as newly visible objects were uploaded,
  then stayed at 1112 from 39 to 153 seconds (1118 at the final stop/view). Samples
  are in `mobile-render-samples.json`. This is a smoke/endurance check, not an
  iPhone hardware benchmark. The temporary test route is removed before delivery.
- Development only: `?quality=mobile` selects the profile for desktop browser QA;
  `canvas[data-render-stats]` reports elapsed render time, frames, draw calls,
  triangles and allocated geometry/texture counts. Production ignores the query
  and uses device detection. These counters are not physical iPhone measurements.

References: [Three.js shadow rendering](https://threejs.org/manual/pages/shadows.html)
and [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
