#!/usr/bin/env bash
# Copies this project's raw Claude Code session transcripts into prompts/ (unedited).
set -euo pipefail
ENCODED="$(pwd | sed 's/[^A-Za-z0-9]/-/g')"
SRC="$HOME/.claude/projects/$ENCODED"
[ -d "$SRC" ] || { echo "Not found: $SRC  (check: ls ~/.claude/projects)"; exit 1; }
mkdir -p prompts
cp -u "$SRC"/*.jsonl prompts/
echo "Copied to prompts/. BEFORE COMMITTING scan for secrets:"
echo "  grep -riEl 'password|secret|api[_-]?key|DATABASE_URL' prompts/"
