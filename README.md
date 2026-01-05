# ColeMcGregor.github.io

This repository hosts my public website via **GitHub Pages**.

The site is the front door for **McGregor Systems LLC**: a plain-English overview of what I do, how I work, and a portfolio of prior work/projects.

---

## Site Structure

The site is  **4 pages** to minimize client search fatigue:

- `index.html` — Landing / overview (who it’s for, what I help with, how to start)
- `business.html` — Everything about the business (services, process, rates, engagement models)
- `aboutme.html` — Everything about me (background, working style, principles, skills summary)
- `portfolio.html` — Proof (contracts + projects, outcomes and examples)

Shared assets live in:

- `assets/style.css` — global site styling + responsive behavior
- `assets/LogoMcGregorSystems*.png` — brand assets
- `assets/ProfessionalPhoto2.jpg` — hero headshot
- `assets/Cole_McGregor_Resume.pdf` — resume download

---

## Local Development

This is a static site. You can run it locally with any simple file server.

### Option A: Python (recommended)
```bash
python -m http.server 8000
