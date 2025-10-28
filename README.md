# cockatrice-turn-analizer

Small SPA to analyze player turn durations from Cockatrice/Tontis logs. Paste or upload a log and get per-player stats, outlier detection and visual timelines.

Main features

- React + Vite single-page app
- Charting with Chart.js (react-chartjs-2)
- Shared parsing/stats module in `src/lib/turns.js`

Quick start

1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm run dev
```

3. Open the URL shown by Vite (usually http://localhost:5173)

Build for production

```powershell
npm run build
```

Deployment

See `README_DEPLOY_FIREBASE.md` for Firebase Hosting deployment instructions.

Notes

- Default font: Roboto.
- Use the light/dark toggle on the top-right to switch palettes.
- Tests: a small Vitest test exists for parsing across midnight (`test/turns.spec.js`).
