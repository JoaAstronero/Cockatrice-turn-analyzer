# Deploying to Firebase Hosting

This project is a Vite + React SPA. To deploy to Firebase Hosting:

1. Build the static site:

```bash
npm run build
```

2. Install Firebase CLI (if not installed):

```bash
npm install -g firebase-tools
```

3. Login and initialize hosting (one-time):

```bash
firebase login
firebase init hosting
# When asked, use 'dist' as the public directory and configure as single-page app.
```

4. Deploy:

```bash
firebase deploy --only hosting
```

Notes:
- The `firebase.json` included in the repo sets `public` to `dist` and rewrites all routes to `index.html` for SPA routing.
- If you want a CI/CD flow, add a GitHub Action that runs `npm ci`, `npm run build`, and `firebase deploy` with a service account.
