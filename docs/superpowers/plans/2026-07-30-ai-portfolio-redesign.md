# AI Application Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Hugo site into a recruiter-focused portfolio for an AI application developer while keeping projects easy to add as Markdown.

**Architecture:** Replace the theme-provided presentation layer with small local Hugo templates: a shared base shell, reusable header/footer/project card partials, a dedicated portfolio home page, and project-specific list/detail layouts. Project metadata lives in front matter so templates can select and sort cards without duplicate homepage data.

**Tech Stack:** Hugo Extended v0.164.0, Go templates, Hugo Pipes CSS minification, Markdown content, GitHub Pages and GitHub Actions.

## Global Constraints

- Keep the existing Hugo + GitHub Pages + GitHub Actions deployment chain.
- Use only confirmed facts in project copy; show `开发中` where results or implementation are incomplete.
- The visual system is deep navy with restrained lime and cyan accents; do not add dense cyberpunk decoration.
- The site must remain usable on desktop and mobile without JavaScript requirements.
- Do not introduce a backend, database, authentication, comments, live market data, or chat features.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `hugo.toml` | Site identity, Chinese locale, contact/configuration data, and navigation. |
| `assets/css/portfolio.css` | Responsive design tokens and all portfolio styling. |
| `layouts/_default/baseof.html` | Shared HTML document, metadata, stylesheet pipeline, header/footer slots. |
| `layouts/partials/site-header.html` | Shared navigation and mobile-safe identity link. |
| `layouts/partials/site-footer.html` | Contact and GitHub footer. |
| `layouts/partials/project-card.html` | Reusable project card driven only by project front matter. |
| `layouts/index.html` | Recruiter-first home page with hero, skills, featured projects, delivery flow, and contact CTA. |
| `layouts/projects/list.html` | Full responsive project grid. |
| `layouts/projects/single.html` | Project case-study layout. |
| `layouts/_default/list.html` | Simple readable list layout for writing and taxonomy pages. |
| `layouts/_default/single.html` | Simple readable article/about layout. |
| `content/projects/*.md` | Project facts and case-study prose. |
| `content/about.md` | Recruiter-focused personal introduction and delivery scope. |
| `tests/portfolio-smoke.ps1` | Static build and rendered-page assertions. |
| `.gitignore` | Ignore Hugo output, build lock, and local brainstorming artifacts. |

## Project front matter interface

Every `content/projects/*.md` page must expose this data shape:

```toml
+++
title = 'Project title'
date = '2026-07-30T18:00:00+08:00'
draft = false
featured = true
weight = 10
status = '开发中'
summary = 'One factual sentence about the problem or product.'
role = '需求梳理、前后端开发与部署'
stack = ['Python', 'LLM']
github = 'https://github.com/owner/repository'
demo = ''
+++
```

`layouts/partials/project-card.html` consumes `.Title`, `.Params.summary`, `.Params.status`, `.Params.stack`, `.Params.github`, `.Params.demo`, and `.RelPermalink`. Empty `demo` values must not render an empty link.

### Task 1: Establish configuration, structured project content, and an automated smoke test

**Files:**
- Modify: `hugo.toml`
- Modify: `.gitignore`
- Modify: `content/projects/_index.md`
- Modify: `content/projects/a-share-kline-terminal.md`
- Create: `content/about.md`
- Create: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Produces: site parameters under `params.profile`, `params.contact`, and `params.skills`; project-card front matter follows the interface above.
- Consumes: no template code; later tasks use these keys verbatim.

- [ ] **Step 1: Write the failing smoke test**

Create `tests/portfolio-smoke.ps1` with the assertions required after the redesign:

```powershell
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$output = Join-Path $env:TEMP 'chendusikao-portfolio-smoke'
Remove-Item -Recurse -Force $output -ErrorAction SilentlyContinue

Push-Location $root
try {
  & (Get-Command hugo -ErrorAction Stop).Source --gc --minify --destination $output
} finally {
  Pop-Location
}

$checks = @{
  'index.html' = @('AI 应用开发工程师', '精选项目', 'GitHub')
  'projects/index.html' = @('项目', 'A 股 K 线终端')
  'projects/a-share-kline-terminal/index.html' = @('开发中', 'GitHub 仓库')
}

foreach ($relativePath in $checks.Keys) {
  $html = Get-Content -Raw (Join-Path $output $relativePath)
  foreach ($expected in $checks[$relativePath]) {
    if ($html -notmatch [regex]::Escape($expected)) {
      throw "Missing '$expected' in $relativePath"
    }
  }
}
```

- [ ] **Step 2: Run the test to verify it fails before the custom portfolio exists**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: FAIL because the current default homepage does not contain `AI 应用开发工程师` or the portfolio sections.

- [ ] **Step 3: Add the data contract**

Update `hugo.toml` with Chinese locale, profile/contact values that are already known, and a truthful skills list. Use empty strings for unknown email and résumé links so templates can safely omit them:

```toml
languageCode = 'zh-CN'
defaultContentLanguage = 'zh-CN'

[params.profile]
  name = 'Chendusikao'
  role = 'AI 应用开发工程师'
  summary = '从需求梳理到 AI 能力接入、前后端实现与部署上线，构建可用的智能应用。'

[params.contact]
  github = 'https://github.com/Chendusikao'
  email = ''
  resume = ''

[params]
  skills = ['LLM 应用', 'RAG', 'Agent', 'Python', '后端开发', '前端开发', '部署上线']
```

Add the project front matter fields described above to `a-share-kline-terminal.md`. Its `status` must be `开发中`; its `summary` may only say it is an A-share K-line visualization and analysis terminal in development. Create `content/about.md` with a short truthful description of the delivery scope. Replace generated-file exclusions with:

```gitignore
public/
resources/
.hugo_build.lock
.superpowers/
```

- [ ] **Step 4: Run the test again**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: still FAIL because templates have not been created. This confirms the test is testing rendered presentation rather than only front matter.

- [ ] **Step 5: Commit the content contract**

```powershell
git add hugo.toml .gitignore content/projects content/about.md tests/portfolio-smoke.ps1
git commit -m "feat: structure portfolio content"
```

### Task 2: Build the shared portfolio shell and responsive design system

**Files:**
- Create: `assets/css/portfolio.css`
- Create: `layouts/_default/baseof.html`
- Create: `layouts/partials/site-header.html`
- Create: `layouts/partials/site-footer.html`

**Interfaces:**
- Consumes: `site.Title`, `site.Params.profile`, `site.Params.contact`, and `site.Menus.main`.
- Produces: `main` and `title` blocks used by all templates, plus CSS classes such as `site-shell`, `site-nav`, `button`, `section-title`, `chip`, and `container`.

- [ ] **Step 1: Add a CSS build assertion to the smoke test**

Append this check after the HTML checks:

```powershell
$css = Get-ChildItem -Path (Join-Path $output 'css') -Filter '*.css' -Recurse
if ($css.Count -eq 0) { throw 'No compiled portfolio stylesheet found' }
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: FAIL with `No compiled portfolio stylesheet found` once Task 1 page-content failures are temporarily resolved; otherwise retain the existing failure until Task 3 introduces the homepage copy.

- [ ] **Step 3: Implement the shell and stylesheet pipeline**

In `layouts/_default/baseof.html`, load `assets/css/portfolio.css` with Hugo Pipes and preserve a clean HTML document:

```go-html-template
{{ $style := resources.Get "css/portfolio.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}" integrity="{{ $style.Data.Integrity }}">
```

Use CSS custom properties for the confirmed palette:

```css
:root {
  --bg: #07111f;
  --surface: #0d1b2d;
  --surface-raised: #12243a;
  --text: #edf5ff;
  --muted: #9badc4;
  --line: rgba(159, 196, 224, .18);
  --lime: #c8ff3d;
  --cyan: #4ed7ff;
  --radius: 18px;
}
```

Style navigation, buttons, cards, typography, grids, focus states, and a single mobile breakpoint at `760px`. The header must include site name and menu links; the footer must always include GitHub and conditionally include email/resume only with non-empty configured values.

- [ ] **Step 4: Run the smoke test and inspect the base output**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: CSS assertion passes. Homepage text assertions can still fail until Task 3.

- [ ] **Step 5: Commit the design system**

```powershell
git add assets/css/portfolio.css layouts/_default/baseof.html layouts/partials/site-header.html layouts/partials/site-footer.html tests/portfolio-smoke.ps1
git commit -m "feat: add portfolio design system"
```

### Task 3: Implement recruiter-first homepage and project card rendering

**Files:**
- Create: `layouts/index.html`
- Create: `layouts/partials/project-card.html`
- Modify: `hugo.toml`

**Interfaces:**
- Consumes: `site.Params.profile`, `site.Params.skills`, `site.Params.contact`, and project pages from `where site.RegularPages "Section" "projects"`.
- Produces: the homepage sections asserted by `tests/portfolio-smoke.ps1`; project cards link to `.RelPermalink` and may link to external GitHub/demo URLs.

- [ ] **Step 1: Extend the failing test for card behavior**

Add this assertion to the homepage check:

```powershell
'index.html' = @('AI 应用开发工程师', '精选项目', 'A 股 K 线终端', 'github.com/Chendusikao/a-share-kline-terminal')
```

- [ ] **Step 2: Run the test to confirm the homepage fails**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: FAIL because the custom homepage and card do not yet render the project data.

- [ ] **Step 3: Implement the home page and reusable card**

In `layouts/index.html`, select at most four featured projects without duplicating content:

```go-html-template
{{ $projects := where site.RegularPages "Section" "projects" }}
{{ $featured := where $projects "Params.featured" true }}
{{ $cards := first 4 (cond (gt (len $featured) 0) $featured $projects) }}
```

Render these sections in order: hero, skills, featured projects, four-step delivery flow (`需求梳理`, `AI 能力接入`, `全栈实现`, `部署上线`), and contact CTA. Render every skill with the shared `chip` class. In `project-card.html`, render only factual front matter; conditionally render `.Params.demo` and `.Params.github`, and include a visible `开发中` status badge when supplied.

Add menu entries for `首页`, `项目`, `关于`, and `联系`; `联系` must anchor to `#contact` on the home page.

- [ ] **Step 4: Run and inspect the homepage test**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: homepage assertions PASS; project-page assertions still fail until Task 4 supplies those layouts.

- [ ] **Step 5: Commit the homepage**

```powershell
git add layouts/index.html layouts/partials/project-card.html hugo.toml tests/portfolio-smoke.ps1
git commit -m "feat: add recruiter-focused homepage"
```

### Task 4: Implement project list, case-study pages, and readable supporting pages

**Files:**
- Create: `layouts/projects/list.html`
- Create: `layouts/projects/single.html`
- Create: `layouts/_default/list.html`
- Create: `layouts/_default/single.html`
- Modify: `tests/portfolio-smoke.ps1`

**Interfaces:**
- Consumes: project-card partial and project front matter from Task 1.
- Produces: `/projects/`, `/projects/<slug>/`, `/about/`, and article pages inside the shared portfolio shell.

- [ ] **Step 1: Add a failing case-study assertion**

Append to the project-page checks:

```powershell
'projects/a-share-kline-terminal/index.html' = @('A 股 K 线终端', '项目背景', '技术方案', '当前进度', 'GitHub 仓库')
```

- [ ] **Step 2: Run the test to confirm the page fails**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: FAIL because the default single-page template does not render the case-study headings.

- [ ] **Step 3: Implement project and supporting layouts**

Render the project list as a responsive grid of `project-card.html` partials. Render each project detail as a case study containing title, status, summary, stack chips, role, `项目背景`, `技术方案`, `当前进度`, and external links. Put the factual A-share K-line text under those headings in its Markdown body; retain `开发中` and do not claim live data, AI capability, metrics, or deployment that have not been confirmed.

Use `_default/list.html` for plain article lists and `_default/single.html` for writing/about pages so the visual system is consistent without over-designing the blog.

- [ ] **Step 4: Run the complete smoke test**

Run: `powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1`

Expected: PASS. Then run `hugo server -D` and manually verify desktop and narrow mobile widths: menu wrapping, hero readability, project-card links, GitHub link, and all four navigation targets.

- [ ] **Step 5: Commit the page templates**

```powershell
git add layouts/projects layouts/_default content/projects tests/portfolio-smoke.ps1
git commit -m "feat: add portfolio project case studies"
```

### Task 5: Verify deployment and prepare the next project additions

**Files:**
- Modify: `README.md` (create only if missing)
- Verify: `.github/workflows/hugo.yaml`

**Interfaces:**
- Consumes: site build from Tasks 1–4 and existing GitHub Pages workflow.
- Produces: a documented local editing workflow and a verified live deployment.

- [ ] **Step 1: Add a short editing guide**

Create `README.md` if it does not exist, documenting these exact commands:

```powershell
cd C:\Users\liang\Documents\my-site
hugo server -D
powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1
git add .
git commit -m "content: add project"
git push
```

Document the project front matter interface from this plan and state that the author must replace empty email/resume values only with real contact details.

- [ ] **Step 2: Run all local verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1
git status --short
```

Expected: smoke test PASS; only intentional, staged documentation changes remain.

- [ ] **Step 3: Commit and push the final redesign**

```powershell
git add README.md .github/workflows/hugo.yaml
git commit -m "docs: explain portfolio maintenance"
git push
```

- [ ] **Step 4: Verify GitHub Pages**

Open `https://github.com/Chendusikao/Chendusikao.github.io/actions`, confirm the newest `Deploy Hugo site to Pages` workflow succeeds, then open `https://chendusikao.github.io/` and verify the homepage and `/projects/` render.

## Plan self-review

- Spec coverage: Tasks 1–4 implement the recruiter-first structure, deep technical visual system, responsive project portfolio, factual project status, and content-driven cards. Task 5 covers maintenance and GitHub Pages verification.
- Placeholder scan: no implementation placeholder is left; unavailable contact data is deliberately represented by empty configuration values and conditional rendering.
- Type consistency: all templates consume the exact `params.profile`, `params.contact`, `params.skills`, and project front matter keys introduced in Task 1.
