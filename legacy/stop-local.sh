#!/usr/bin/env bash
# Stop the local MySQL server started by start-local.sh.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MYSQLADMIN=/opt/anaconda3/bin/mysqladmin
SOCK=/tmp/hsk-mysql.sock

if [ -S "$SOCK" ]; then
  "$MYSQLADMIN" --no-defaults -u root --socket="$SOCK" shutdown 2>/dev/null \
    && echo "MySQL stopped." \
    || echo "Could not stop MySQL via socket (it may not be running)."
else
  echo "MySQL socket not found; nothing to stop."
fi
echo "Stop the PHP web server with Ctrl+C in its terminal, or: pkill -f '127.0.0.1:8080'"
