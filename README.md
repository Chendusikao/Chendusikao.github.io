# Chendusikao's portfolio

This Hugo site is published with GitHub Pages. Edit the site from the repository root and use the following commands to preview, verify, and publish a content update:

```powershell
cd C:\Users\liang\Documents\my-site
hugo server -D
powershell -ExecutionPolicy Bypass -File tests/portfolio-smoke.ps1
git add .
git commit -m "content: add project"
git push
```

Stop the local Hugo server with `Ctrl+C` after previewing the change. Before committing, review `git status --short` and do not add generated `public/`, `resources/`, `.hugo_build.lock`, `.superpowers/`, or `.worktrees/` files.

## Project content

Create project pages in `content/projects/` with TOML front matter. The project-card interface is:

```toml
+++
title = 'Project name'
date = '2026-07-30T18:00:00+08:00'
draft = false
featured = false
weight = 10
status = 'Development status'
summary = 'A factual, concise description of the project.'
role = 'Your real role on the project'
stack = ['Technology actually used']
github = 'https://github.com/owner/repository'
demo = 'https://example.com/'
+++
```

Use only real project details. `role`, `stack`, `github`, and `demo` may be empty when the information or link is unavailable; the site will omit the corresponding UI. Set `featured` to `true` only for a project that should appear on the homepage.

Site-wide information lives in `hugo.toml`: `params.profile` contains `name`, `role`, and `summary`; `params.contact` contains `github`, `email`, and `resume`; and `params.skills` is the skills list. The author must replace empty `email` and `resume` values only with real contact details.
