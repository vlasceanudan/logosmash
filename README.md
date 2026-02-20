# Logo Smash v1

Standalone browser version of the PORR-themed cannon-smash game.

## Features

- Modular game architecture (`src/game`, `src/ui`, `src/services`)
- Desktop + mobile input
- 10-shot score challenge loop
- Supabase leaderboard (nickname, no login)
- GitHub Pages deployment workflow

## Project Structure

- `index.html`: app shell
- `styles/`: base + game + components styles
- `src/main.js`: bootstrap and wiring
- `src/game/`: config, state, input, physics, render, loop
- `src/ui/`: overlay, HUD, leaderboard view
- `src/services/`: Supabase leaderboard client + local storage helpers
- `supabase/schema.sql`: table, index, and RLS policies
- `.github/workflows/deploy.yml`: Pages deploy workflow
- `LogoSmash.html`: legacy reference file (original version)

## Run Locally

Because this project uses ES modules, serve it from a local HTTP server.

Example with Python:

```bash
python -m http.server 5500
```

Then open:

`http://localhost:5500`

## Supabase Setup

1. Create a Supabase project.
2. In Supabase SQL editor, run `supabase/schema.sql`.
3. Get your project URL and anon public key.
4. Edit `index.html` and set:

```html
<script>
  window.LOGO_SMASH_ENV = {
    SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_PUBLIC_KEY"
  };
</script>
```

If these values are empty, game still runs but leaderboard calls fail with a clear message.

## GitHub Publish (Manual)

Run these commands in this folder:

```bash
git init
git add .
git commit -m "feat: standalone logo smash v1"
git branch -M main
git remote add origin https://github.com/<your-user>/<repo>.git
git push -u origin main
```

Then in GitHub:

1. Open repository settings.
2. Go to **Pages**.
3. Source: **GitHub Actions**.
4. Push to `main` to trigger `.github/workflows/deploy.yml`.

## Known Limitations

- Leaderboard is client-submitted (best-effort anti-cheat only).
- No authentication in MVP.
- Single level/mode by design.
