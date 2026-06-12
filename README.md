# mukthanand

Personal portfolio for Mukthanand Reddy, framed as a production system / status page.

- Dark, premium, editorial design. Single cyan accent + semantic status colors.
- React + Vite + TypeScript + Tailwind + Framer Motion + Lenis.
- Deployed to GitLab Pages.

See [`AGENTS.md`](./AGENTS.md) for the full vision, design system, and contribution rules. Section specs live in [`specs/`](./specs).

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
# install dependencies
npm ci        # or: npm install (first time, before a lockfile exists)

# start the dev server (hot reload)
npm run dev
# open the printed URL, typically http://localhost:5173

# type-check + production build
npm run build

# preview the production build locally
npm run preview
```

## Verify before pushing

1. `npm run build` completes with no errors and outputs to `dist/`.
2. `npm run preview` serves the built site and all routes work:
   `/status`, `/services`, `/changelog`, `/stack`, `/contact`.
3. Toggle OS "reduce motion" and confirm smooth scroll + spring animations are disabled.
4. Check responsive layout at 320px, 768px, 1280px, 1920px (no horizontal overflow).
5. Run a Lighthouse audit (target Performance >= 90; accessibility AA contrast).

## Deploy

Pushing to the default branch triggers `.gitlab-ci.yml`:
- `build` job runs `npm install && npm run build` and saves `dist/`.
- `pages` job copies `dist/` into `public/` and publishes to GitLab Pages.

Live Pages URL: https://mukthanandreddy21.gitlab.io/mukthanand/

