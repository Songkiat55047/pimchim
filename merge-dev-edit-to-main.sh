#!/usr/bin/env bash
set -euo pipefail

# Merges dev-edit into main now that conflicts have already been
# resolved on dev-edit (see commit 5a9cc82). This should be a clean,
# fast-forward-free merge with no conflicts.

git fetch origin main dev-edit

git checkout main
git pull origin main

git merge --no-ff origin/dev-edit -m "Merge branch 'dev-edit' into main"

echo
echo "Merge complete locally. Review with:"
echo "  git log --oneline -10"
echo "  git diff origin/main --stat"
echo
echo "If it looks good, push with:"
echo "  git push origin main"
