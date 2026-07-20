# Nathaniel Wihardjo Personal Website

Personal portfolio for `https://nwihardjo13.github.io`.

The site uses Node for local development and build tooling, then deploys as static assets through GitHub Pages.

## Stack Overview

This is a static portfolio with a Node-based build step.

- Runtime: static HTML, CSS, and browser JavaScript. No Node server is used in production because GitHub Pages only serves static files.
- Build tool: Vite. It gives a fast local dev server, bundles `src/main.js` and `src/styles.css`, fingerprints built assets, and writes production output to `dist/`.
- Package manager: npm, with `package-lock.json` committed so GitHub Actions can run reproducible `npm ci` installs.
- Hosting: GitHub Pages. The Pages workflow builds the site, uploads `dist/`, and deploys it to `https://nwihardjo13.github.io`.
- Assets: `public/` contains files copied directly into the final build, including the CV PDF, company logos, and `.nojekyll`.
- UI libraries: Lucide icons are loaded from a CDN script. The page itself stays framework-free because the current interaction model does not need React state or routing.

This stack keeps the site cheap to host, easy to deploy, and simple to migrate later if it grows into a React/Vue/Svelte app.

## Contact Form Plan

The current contact form falls back to `mailto:` from browser JavaScript. That is dependency-free, but it opens the visitor's email client and is less reliable on mobile or locked-down machines.

Recommended next step: use a static-form service that posts directly from GitHub Pages.

- Web3Forms/W3Forms is the simplest fit: create an access key, post directly to the form API, and keep the site fully static.
- Formspree is also viable: create a form, use the generated `https://formspree.io/f/{form_id}` endpoint, and submit with `method="post"`.
- EmailJS works client-side too, but it adds SDK/template setup and is more moving parts than this form currently needs.

Implementation preference: W3Forms first, with the access key configured as a Vite environment variable and injected at build time. If no key is set, keep the current `mailto:` fallback.

The form is already wired for that path:

```bash
cp .env.example .env.local
```

Then set:

```bash
VITE_W3FORMS_ACCESS_KEY=your-access-key
```

The access key should be the public form submission key, not the hosted-form iframe URL or an account API token. Newer W3Forms keys are prefixed like `w3f_...`; older Web3Forms keys may be UUID-style, such as `f980...`. The site supports both key styles. For UUID-style Web3Forms keys, it uses native browser form submission to `https://api.web3forms.com/submit` with a hidden `access_key` field.

Run `npm run build` and deploy. Without that variable, the form opens a prefilled email client instead.

For GitHub Pages, add a repository secret named `W3FORMS_ACCESS_KEY`. The workflow maps that secret into Vite as `VITE_W3FORMS_ACCESS_KEY` during `npm run build`.

## Local structure

- `index.html`: Vite entry document.
- `src/styles.css`: portfolio styling.
- `src/main.js`: reveal behavior, active nav state, icons, and contact form mailto behavior.
- `public/`: static assets copied directly into the production build.
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Hosting

Pushes to `main` run the Pages workflow. The workflow installs dependencies, builds the Vite site, uploads `dist/`, and deploys it to GitHub Pages.
