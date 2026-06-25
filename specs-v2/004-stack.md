# specs-v2 / 004 — /stack (Skills)

## Purpose
Show technical depth honestly. No skill bars, no bubble charts, no percentages. Skills grouped by discipline with honest proficiency signaling.

## Layout
Section slug + description, then tab-navigated discipline groups. Tabs across the top, active panel below with skill cards in a grid.

## Tab Navigation
- Pill-shaped buttons for each discipline
- Active tab: gold underline indicator (Framer Motion `layoutId`)
- Hover: muted color transition

## Skill Card Anatomy
- **Proficiency blocks:** `■ ■ ■` (strongest, accent), `■ ■ □` (strong, green), `■ □ □` (familiar, muted)
- **Skill name:** With icon, transitions to accent on hover
- **Note:** One-line description of experience
- **Magnetic tilt:** Card subtly tilts toward cursor on hover

## Discipline Groups
1. **LANGUAGES** — Python, JavaScript/TypeScript, SQL, Java, C
2. **BACKEND** — FastAPI, PostgreSQL, REST API Design, Flask, SQLAlchemy/Alembic, RAG Pipelines
3. **FRONTEND** — React, TypeScript, Tailwind CSS, HTML/CSS
4. **DEVOPS & TOOLS** — Git, GitLab CI/CD, Linux, Bruno, Docker
5. **AI & ML** — Hybrid Retrieval, Prompt Engineering, Groq APIs, Agentic AI, Sentence-Transformers, Linear Regression

## Scroll Animation
Cards use Framer Motion `motion.div` with staggered entrance (`opacity: 0, y: 8` → `opacity: 1, y: 0`). Tab switches use `LayoutGroup` for smooth pill underline animation.

## Acceptance
- [ ] Zero skill bars, progress bars, percentages, or radar charts
- [ ] Proficiency dot colors match spec
- [ ] Skills wrap cleanly on 375px
- [ ] STRONGEST label max twice per group
