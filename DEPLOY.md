Deployment options for Pirate Ocean

1) GitHub Pages (recommended for quick static deploy)

- Push this repository to GitHub and ensure your default branch is main.
- The included GitHub Actions workflow (.github/workflows/deploy.yml) runs on push to main and will deploy the repository root to GitHub Pages.

How it works:
- The workflow installs dependencies, copies the repo contents into a public/ folder (excluding .git, node_modules, and CI files), and uploads that folder as the Pages artifact.
- GitHub Pages then serves the uploaded artifact.

Notes:
- You must enable GitHub Pages in the repository settings if required; the Actions workflow should create the Pages deployment automatically.
- If your default branch is not main, update the workflow trigger accordingly.

2) Netlify / Vercel (alternative, easy drag-and-drop or connected deploy)

- Log into Netlify or Vercel and connect the GitHub repository, or drag-and-drop the site folder from a local build.
- For Netlify, point the publish directory to / (or public if you create one) and add build settings if you later introduce a build step.

3) Local preview

- Start a local static server from the repo root using one of the npm scripts:
- npm run start
- or
- npm run dev

Both use http-server (already in devDependencies) and serve the site on port 8000.

4) Notes & next steps

- If you want a single-command deploy from your machine, consider adding gh-pages or a CI/CD token and a deploy script.
- If you prefer I can add a gh-pages script, or generate a simple Netlify/Vercel configuration—tell me which provider you prefer and I'll add it.
