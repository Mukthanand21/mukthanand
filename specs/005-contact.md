# Spec 005  /contact (POST /hire)

## Purpose
Let someone reach out, styled as a `POST /hire` request but clean and usable.

## Content
- Fields: name, email, message.
- Real submission via a static form service (Formspree / Web3Forms).
- Success + error states styled as response previews (subtle, not gimmicky).
- Direct email + GitHub/GitLab/LinkedIn links as fallback.

## Visual / motion
- Clean form, one cyan submit. Mono accents only as texture.
- Respect reduced motion on success animation.

## Acceptance
- Submission actually works. Fully keyboard accessible.
