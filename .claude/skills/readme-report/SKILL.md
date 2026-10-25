---
name: readme-report
description: Use at the end of the project to build README sections and the test report.
---

# README and test report
1. Run `backend/.venv/bin/pytest --cov=app --cov-report=term-missing -q` and the frontend tests; capture the real output (test counts, pass/fail, coverage %).
2. README sections, in order: What this is, Tech stack, Setup (backend venv + install, seed admin, run API, frontend), Running tests, Test report (pasted real output), Design decisions (from docs/DECISIONS.md), Screenshots (placeholders I will fill), My AI Usage.
3. "My AI Usage": leave clearly marked TODO blocks for tools used (include Gemini planning chat and Claude Code), how used, and reflection. Do NOT write my reflection for me; I must write it in my own words.
4. Do not invent numbers: use only real command output.
