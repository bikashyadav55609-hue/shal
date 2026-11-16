# Deploying A Little World Made for Shaluu to Netlify

This is a Vite + React + TypeScript website. It does not make Gemini API calls in its current source code, so the frontend itself does not require a Gemini API key or Google Cloud billing to run.

## Recommended: deploy from GitHub

1. Create a GitHub account and a new repository (for example `a-little-world-for-shaluu`).
2. Upload the contents of this project folder to the repository. Upload the files inside the folder, not the outer ZIP itself.
3. In Netlify, choose **Add new project** → **Import an existing project** → **GitHub**.
4. Select the repository. Netlify should read `netlify.toml` automatically. Confirm:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Choose **Deploy**. Netlify installs dependencies and builds the site.

## Alternative: manual drag-and-drop

Manual drag-and-drop requires a built site. On a computer with Node.js installed:

1. Open a terminal in this project folder.
2. Run `npm install`.
3. Run `npm run build`.
4. Open the generated `dist` folder and drag that folder into Netlify Drop at https://app.netlify.com/drop.

Do not drag the original source folder or ZIP into Netlify Drop; upload the generated `dist` folder.

## Notes

- No environment variables are currently needed for the frontend build.
- The YouTube player uses the supplied YouTube video ID and still depends on YouTube/browser playback rules.
- Photos and settings saved in browser storage are local to that browser/device; they are not automatically shared between devices.
