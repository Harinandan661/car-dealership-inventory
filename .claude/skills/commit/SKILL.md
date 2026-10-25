---
name: commit
description: Use when committing. Writes the commit message in the required format with the AI co-author trailer.
---

# Commit
1. Run `git status` and `git diff --staged` (stage relevant files first if nothing is staged).
2. Message format:
   - Subject: `type: short imperative summary` with type in test | feat | refactor | fix | docs | chore. Use `test:` for RED commits, `feat:`/`fix:` for GREEN, `refactor:` for REFACTOR.
   - Body: 1-3 lines on what AI did and what I did manually (be honest and specific).
   - Blank line, then the trailer exactly: `Co-authored-by: Claude <noreply@anthropic.com>`
3. Show me the message and wait for approval, then run `git commit`.
4. Check the final message contains the trailer once only (no duplicate trailers).
