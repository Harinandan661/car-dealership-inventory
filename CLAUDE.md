# Car Dealership Inventory Kata

Full-stack TDD kata. Requirements: docs/KATA.md. Fixed design decisions: docs/DECISIONS.md. Implementation plan: docs/PLAN.md.
Read those only when the task needs them, not every turn.

## Stack
- backend/: Python, FastAPI, SQLAlchemy, SQLite (persistent file, never in-memory), Pydantic, bcrypt, PyJWT, Pytest + pytest-cov + httpx
- frontend/: Vite + React + Tailwind CSS, React Router, Vitest + React Testing Library

## Commands
- Backend tests: `backend/.venv/bin/pytest -q --tb=short` (always this; never verbose output)
- Coverage: `backend/.venv/bin/pytest --cov=app --cov-report=term-missing -q`
- Run API: `cd backend && .venv/bin/uvicorn app.main:app --reload`
- Seed admin: `cd backend && .venv/bin/python -m app.seed`
- Frontend: `cd frontend && npm run dev` / `npm test`

## Rules
- Backend is strict TDD: use /tdd-cycle. Tests first, one step at a time, stop after each step.
- Layering: routers -> services -> repositories. No DB queries in routers.
- SOLID, small functions, type hints, docstrings that explain why, not what.
- Do not read .venv, node_modules, dist, coverage output, lockfiles, *.db or .env. Do not re-read files already in context.
- Keep replies short. No unrequested features or refactors. If a requirement is ambiguous, ask.
- Commits: use /commit. Every commit carries the co-author trailer.
- Never commit secrets or dealership.db.
