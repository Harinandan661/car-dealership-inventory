---
name: tdd-cycle
description: Use when implementing any backend feature or endpoint. Enforces strict red-green-refactor as separate steps.
---

# TDD cycle
Argument = the feature (e.g. "POST /api/auth/register").

1. Read only the matching section of docs/PLAN.md and the relevant rules in docs/DECISIONS.md.
2. RED: write failing tests ONLY. No real implementation (route/function stubs that return 501 or raise NotImplementedError are allowed so tests collect). Run `backend/.venv/bin/pytest -q --tb=short`, confirm they fail for the right reason. Report the failing test names. STOP and wait for me to commit.
3. GREEN: only after I say so, write the MINIMAL code that makes the tests pass. Run tests. STOP and wait for me to commit.
4. REFACTOR: only after I say so, improve structure/naming with tests staying green. Run tests. STOP.

Keep each cycle small: one endpoint or one tightly related group, not a whole resource.
Never combine steps. Never edit a test during GREEN unless the test is wrong, and say so explicitly.
