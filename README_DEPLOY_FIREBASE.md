# Deploying cockatrice-turn-analizer to Firebase Hosting

This project is a Vite + React SPA (cockatrice-turn-analizer). Follow these steps to build and deploy to Firebase Hosting.

1. Build the static site:

```powershell
npm run build
```

2. Install Firebase CLI (if not installed):

```powershell
npm install -g firebase-tools
```

3. Login and initialize hosting (one-time):

```powershell
firebase login
firebase init hosting
# When asked, use 'dist' as the public directory and configure as a single-page app (rewrite all routes to index.html).
```

4. Deploy:

```powershell
firebase deploy --only hosting
```

Notes

- The `firebase.json` included in the repository sets `public` to `dist` and rewrites all routes to `index.html` for SPA routing.
- For automated deploys you can add a GitHub Action that runs `npm ci`, `npm run build`, then `firebase deploy` with a service account.

Repository / directory rename instructions

If you want to rename the GitHub repository and the local directory to `cockatrice-turn-analizer`, do the following:

1. On GitHub (web UI):

   - Go to Settings → Repository name → change it to `cockatrice-turn-analizer`.

2. Locally, rename the folder and update the remote (example for Windows PowerShell):

```powershell
# in the folder above the project
ren tontis cockatrice-turn-analizer
cd .\cockatrice-turn-analizer
# update origin remote to the new repo URL (replace <your-username>)
git remote set-url origin git@github.com:<your-username>/cockatrice-turn-analizer.git
git push origin --set-upstream main
```

3. Optional: update `package.json` `name` field (already updated in this repo) and README to reflect the new name.

If you'd like, I can add a small GitHub Action that builds and deploys to Firebase on each push to `main`. Ask and I'll scaffold it.
