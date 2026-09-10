# Assets

Place compressed runtime models in `public/models/` as `.glb`.

Keep large unprocessed sources in `raw-assets/` (gitignored). Record every third-party file here before it ships.

| File | Source | License | Notes |
|------|--------|---------|-------|
| — | — | — | No production GLB yet. Hero mesh is a procedural icosahedron. |

Budgets (from the agent team research):

- Hero GLB < 8 MB (Draco / meshopt)
- Supporting GLB < 2 MB
- Textures: KTX2/Basis or resized JPEG/WebP, max 2K hero / 1K otherwise
