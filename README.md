# ProjectHub (Electron)

ProjectHub is a dark-themed Electron app for generating and managing projects using local JSON metadata under `~/.projecthub`.

## Tech Stack
- Electron + electron-vite
- React + Tailwind (Kiro color theme)
- TypeScript
- Lucide icons
- Local JSON storage

## Structure
```
src/
  main/        // Electron main process + IPC
  preload/     // Context bridge exposing safe APIs
  renderer/    // React UI (no separate web build)
  shared/      // Types, constants, JSON helpers
```

## Data Locations
- Settings: `~/.projecthub/settings.local.json`
- Templates: `~/.projecthub/templates/*.json`
- Libraries: `~/.projecthub/libraries/*.json`
- Projects: `~/.projecthub/projects/*.json`

### Templates
- User-provided templates live in `~/.projecthub/templates` (e.g., `workspaces/` for folder sets, `configuration/gitignore-*.json`, `configuration/env-*.json`).
- The Add Project wizard lets you select multiple templates. Workspace templates create folders; gitignore/env templates create files in the chosen destination and prompt to overwrite or skip if the file already exists.
- You can add new template files at any time; the wizard refreshes automatically.

## Scripts
- `npm run dev` — start electron-vite dev (main, preload, renderer)
- `npm run build` — production build
- `npm run lint` — ESLint (150-line guards enabled)
- `npm run typecheck` — TypeScript

## UI Pages
- Dashboard (counts, recent projects)
- Templates, Libraries, Projects (MetadataGrid with search/sort)
- Project wizard (template → details → libraries → review → create project JSON)
- Settings (theme, accent color, line-limit toggle, open data folder)

## Notes
- Default settings/theme follow PRD (dark + Kiro palette).
- Flat directory rule honored; JSON read/write only at first level.
- Renderer uses sandboxed preload; no Node globals exposed.
