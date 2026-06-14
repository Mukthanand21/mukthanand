# specs-v2 / 004 — /stack (Skills)

## Purpose
Show technical depth honestly.
No skill bars. No bubble charts. No percentage ratings. No "95% Python."
Skills are grouped by discipline, with proficiency signaled through honest labels only.
A recruiter should see: what you know deeply, what you know well, what you've touched.

---

## Layout

Section slug + title, then a vertical list of discipline groups.
Each group is a card. Cards are full-width, stacked vertically.

```
/stack

  Skills grouped by discipline. Depth signaled honestly — no filler, no charts.

  ┌──────────────────────────────────────────────────────┐
  │  LANGUAGES                                           │
  │                                                      │
  │  Python  ● STRONGEST    JavaScript / TypeScript  ● STRONG    SQL  ● STRONG    Java  ● FAMILIAR │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │  BACKEND                                             │
  │  ...                                                 │
  └──────────────────────────────────────────────────────┘
```

---

## Skill Item Anatomy

```
[Skill name]  ●  [PROFICIENCY LABEL]
```

- **Skill name:** `--text-md`, weight 500, `--color-text-primary`
- **Dot:** `5px` circle, color depends on proficiency (see below)
- **Proficiency label:** mono, `--text-xs`, uppercase, letter-spacing `0.08em`

### Proficiency levels + colors
| Label | Dot color | Meaning |
|---|---|---|
| STRONGEST | `--color-accent` (gold) | Daily use, deepest expertise |
| STRONG | `--color-success` (sage green) | Comfortable, used in production |
| FAMILIAR | `--color-text-muted` (plum-muted) | Used in projects, not daily |

Max 1–2 STRONGEST per discipline group. Be honest.

---

## Discipline Groups (placeholder until #16)

### LANGUAGES
- Python ● STRONGEST
- JavaScript / TypeScript ● STRONG
- SQL ● STRONG
- Java ● FAMILIAR

### BACKEND
- FastAPI ● STRONGEST
- REST API Design ● STRONGEST
- PostgreSQL ● STRONG
- RAG Pipelines ● STRONG
- FAISS ● STRONG
- API Gateway Patterns ● STRONG
- SQLAlchemy / Alembic ● STRONG

### FRONTEND
- React ● STRONG
- TypeScript ● STRONG
- Tailwind CSS ● STRONG
- HTML / CSS ● STRONG

### DEVOPS & TOOLS
- GitLab CI/CD ● STRONG
- Git (rebase, force-with-lease) ● STRONG
- Linux (Ubuntu) ● STRONG
- Docker ● FAMILIAR
- AWS (Cloud Foundations) ● FAMILIAR

### AI & ML
- Hybrid Retrieval (FTS + pg_trgm) ● STRONGEST
- Prompt Engineering ● STRONG
- Groq API / LLM Integration ● STRONG
- Sentence-Transformers ● FAMILIAR
- wav2vec2 / ASR ● FAMILIAR

---

## Group Card Anatomy

```
┌────────────────────────────────────────────────────┐
│  [DISCIPLINE LABEL]                                │  ← mono, --text-xs, --color-text-muted, uppercase
│                                                    │
│  [skill] ● LABEL   [skill] ● LABEL   [skill] ...  │  ← wrapping flex row
└────────────────────────────────────────────────────┘
```

- Card background: `--color-bg-elevated`
- Card border: `0.5px solid --color-border`
- Card border-radius: `12px`
- Card padding: `24px`
- Skills layout: `display: flex; flex-wrap: wrap; gap: 20px 32px`

---

## Scroll Animation
Cards reveal on scroll: `translateY(20px→0)` + `opacity(0→1)`, `500ms`, `--ease-spring`.
Stagger: 80ms between cards.

---

## Acceptance Criteria
- [ ] Zero skill bars, progress bars, percentages, or radar charts anywhere
- [ ] Proficiency dot colors match the table above exactly
- [ ] Skills wrap cleanly on 375px — no horizontal overflow
- [ ] STRONGEST label appears max twice per group
- [ ] Section is scannable in under 10 seconds — no dense walls of text
