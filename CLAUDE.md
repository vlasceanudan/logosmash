# CLAUDE.md — LogoSmash Codebase Guide

This file provides AI assistants with the context needed to work effectively in this repository.

---

## Project Overview

**LogoSmash** is a vanilla JavaScript browser-based brick-breaker game. Players fire balls from a cannon to destroy logo-shaped brick patterns. It features an optional cloud leaderboard backed by Supabase.

- **Language**: JavaScript (ES6 modules), CSS3, HTML5
- **Framework**: None — zero dependencies, no build step
- **Hosting**: GitHub Pages (auto-deployed from `main`)
- **Backend**: Optional Supabase REST API for the leaderboard
- **Canvas**: 640×480 px, 60 fps via `requestAnimationFrame`

---

## Repository Structure

```
logosmash/
├── index.html                  # App shell; loads ES modules, references config.js
├── config.js                   # Sets window.LOGO_SMASH_ENV (Supabase credentials)
├── LogoSmash.html              # Legacy monolithic reference implementation (read-only)
├── README.md                   # User-facing setup and deployment docs
├── .env.example                # Template for required env vars
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD (triggers on push to main)
├── src/
│   ├── main.js                 # Entry point: wires all modules, starts game loop
│   ├── game/
│   │   ├── config.js           # Game constants (canvas size, brick pattern, physics params)
│   │   ├── state.js            # State factory and reset logic
│   │   ├── input.js            # Keyboard, mouse, and touch input handlers
│   │   ├── physics.js          # Ball/brick collision, shooting, movement, win/loss logic
│   │   ├── loop.js             # requestAnimationFrame game loop
│   │   └── render.js           # Canvas 2D rendering (cannon, balls, bricks, HUD, trajectory)
│   ├── services/
│   │   ├── leaderboardClient.js # Supabase REST client (fetch/submit scores)
│   │   └── storage.js           # LocalStorage wrapper (nickname persistence)
│   └── ui/
│       ├── overlay.js          # Start/end-screen modal controller
│       ├── hud.js              # Speed slider controller
│       └── leaderboardView.js  # Leaderboard table rendering
├── styles/
│   ├── base.css                # CSS custom properties, typography, reset
│   ├── game.css                # Game layout, canvas, overlay styles
│   └── components.css          # Buttons, forms, leaderboard table
└── supabase/
    └── schema.sql              # PostgreSQL table + RLS policies for Supabase
```

---

## Architecture and Key Patterns

### No Build Step
The project uses native ES6 `import`/`export` loaded directly in the browser. There is no Webpack, Vite, or other bundler. Files must be served over HTTP (not `file://`) because of CORS and module restrictions.

```bash
# Serve locally with Python
python3 -m http.server 8080
# or
npx serve .
```

### Module Roles
| Module | Responsibility |
|---|---|
| `src/game/config.js` | Pure constants — canvas dimensions, brick layout pattern, physics parameters |
| `src/game/state.js` | Factory function that creates/resets game state objects |
| `src/game/physics.js` | Pure functions that mutate state each frame (movement, collision, end conditions) |
| `src/game/render.js` | Pure canvas rendering — reads state, draws to canvas |
| `src/game/loop.js` | Wires physics + render into a `requestAnimationFrame` loop |
| `src/game/input.js` | Attaches DOM event listeners, maps input to state mutations |
| `src/services/leaderboardClient.js` | Supabase REST API calls (fetch top scores, upsert score) |
| `src/services/storage.js` | `localStorage` read/write for nickname persistence |
| `src/ui/overlay.js` | Renders start/end screens and handles score submission flow |
| `src/ui/hud.js` | Syncs speed slider DOM element to game state |
| `src/ui/leaderboardView.js` | Fetches and renders the leaderboard table |
| `src/main.js` | Imports all modules, gets DOM refs, wires everything together |

### State Object Shape
Created by `state.js`; mutated by `physics.js` and `input.js`:

```js
{
  phase: 'idle' | 'running' | 'ended',
  shooterX: number,          // Cannon X position (pixels)
  aimAngle: number,          // Radians from vertical
  balls: [{ x, y, vx, vy }],
  bricks: [{ col, row, x, y, w, h, alive }],
  score: number,
  shotsRemaining: number,
  ballSpeed: number,         // Units per frame (2–9)
  onEnd: function,           // Callback on game over
}
```

### Configuration Pattern
Supabase credentials are injected via a global on `window`:

```js
// config.js (not committed with real values)
window.LOGO_SMASH_ENV = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
};
```

The game gracefully degrades if credentials are absent — leaderboard shows "not configured" but the game still plays.

---

## Database (Supabase)

**Table**: `logo_smash_scores`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `nickname` | `text` | 2–20 chars; unique case-insensitively |
| `high_score` | `integer` | >= 0 |
| `updated_at` | `timestamptz` | Auto-updated on insert |

**RLS Policies** (see `supabase/schema.sql`):
- Public `SELECT` — anyone can read the leaderboard
- Public `INSERT`/`UPDATE` — anyone can submit, enforced within character and value limits

**Score submission logic** (`leaderboardClient.js`):
1. Case-insensitive lookup by nickname
2. If not found → insert new row
3. If found and new score is higher → `PATCH` existing row
4. If found and existing score is higher → return "Not saved: your high score is X"

---

## Code Style Conventions

### JavaScript
- **Indentation**: 2 spaces
- **Semicolons**: Always used
- **Naming**:
  - Variables/functions: `camelCase`
  - Constants: `SCREAMING_SNAKE_CASE`
  - CSS class IDs in JS: prefixed with `ls-` (e.g., `ls-canvas`, `ls-overlay`)
- **Module exports**: Named exports at the top level (`export function foo() {}`)
- **Factory functions**: Preferred for stateful controllers (e.g., `createHudController(state, el)`)
- **HTML escaping**: Always escape user-provided text before inserting into `innerHTML`

  ```js
  function escHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
  ```

- **Error handling**: `try/catch` with descriptive messages returned to callers, not thrown

### CSS
- **Namespace prefix**: All classes use `.ls-` (Logo Smash)
- **Custom properties**: Colors and spacing defined as `--ls-*` variables in `base.css`
- **Layout**: Flexbox throughout; responsive via `clamp()`
- **No CSS framework** — all styles are hand-written

### HTML
- **Semantic elements**: `<main>`, `<section>`, `<header>`, `<form>`
- **ARIA**: `aria-label`, `aria-live`, `aria-modal` where appropriate
- **Form validation**: HTML5 `required`, `minlength`, `maxlength` attributes; `novalidate` on forms where JS handles validation
- **No inline event handlers**: All events attached via `addEventListener`

---

## Development Workflow

### Running Locally
```bash
# Option 1 – Python (no install required)
python3 -m http.server 8080

# Option 2 – Node serve
npx serve .
```

Then open `http://localhost:8080` in a browser.

### Configuring Supabase (optional)
1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key into `config.js`:

   ```js
   window.LOGO_SMASH_ENV = {
     SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
     SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
   };
   ```

4. **Do not commit real credentials** — `config.js` is git-ignored in production usage; use `.env.example` as a reference.

### Deployment
Push to `main` — GitHub Actions automatically deploys to GitHub Pages via `.github/workflows/deploy.yml`. No manual steps needed.

---

## What Does Not Exist

Be aware of these **intentional absences** before suggesting tooling changes:

| Missing | Why |
|---|---|
| `package.json` | No npm dependencies; no build step |
| Test suite | No Jest/Vitest/etc.; testing is manual |
| Linter/formatter | No ESLint/Prettier configuration |
| Git hooks | No Husky or pre-commit hooks |
| `.env` file | No Node runtime to parse it; credentials set directly in `config.js` |
| Bundler | Native ES modules served directly |

Do not add these unless explicitly requested. The zero-dependency architecture is deliberate.

---

## Common Tasks for AI Assistants

### Adding a new game feature
1. Add constants to `src/game/config.js` if needed
2. Extend the state shape in `src/game/state.js`
3. Add or modify physics logic in `src/game/physics.js`
4. Update rendering in `src/game/render.js`
5. Wire up inputs in `src/game/input.js` if user interaction is needed
6. Update `src/main.js` only if new DOM references or initializations are required

### Adding a new UI component
1. Add HTML elements to `index.html`
2. Add styles to the appropriate file in `styles/`
3. Create a controller in `src/ui/` following the factory function pattern
4. Import and initialize in `src/main.js`

### Modifying the leaderboard
- Schema changes: update `supabase/schema.sql` and apply in the Supabase dashboard
- API changes: update `src/services/leaderboardClient.js`
- Display changes: update `src/ui/leaderboardView.js`

### Changing game physics or layout
- All tunable constants live in `src/game/config.js` — prefer changing them there rather than hardcoding values in other files

---

## Security Notes

- **Client-side scores**: Scores are submitted directly from the browser with no server-side validation beyond Supabase RLS policies. This is a known limitation — see README.md.
- **HTML escaping**: Always escape any user-supplied strings (nickname, etc.) before rendering into `innerHTML`.
- **Anon key exposure**: The Supabase anon key is intentionally public-facing (it is a client-side key designed for browser use). Do not confuse it with the service role key, which must never be exposed.
- **No authentication**: The leaderboard uses public RLS policies. There is no user login system.

---

## Key Files to Read First

When working in this codebase, read these files in this order for the fastest orientation:

1. `src/game/config.js` — understand the data model and constants
2. `src/game/state.js` — understand the state shape
3. `src/main.js` — understand how everything is wired together
4. The specific module relevant to your task
