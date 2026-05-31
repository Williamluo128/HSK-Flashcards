#!/usr/bin/env bash
# Start the HSK-Flashcards app locally (MySQL + PHP built-in server).
# Everything self-contained under .localdb/ — no system-wide install required.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MYSQLD=/opt/anaconda3/bin/mysqld
MYSQL=/opt/anaconda3/bin/mysql
PHP="$ROOT/.localdb/php"
DATADIR="$ROOT/.localdb/data"
SOCK=/tmp/hsk-mysql.sock
PIDFILE="$ROOT/.localdb/mysqld.pid"
PORT=3306
HTTP_PORT=8080

# 1. Start MySQL if not already running.
if [ -S "$SOCK" ] && "$MYSQL" --no-defaults -u root --socket="$SOCK" -e "SELECT 1" >/dev/null 2>&1; then
  echo "MySQL already running."
else
  echo "Starting MySQL..."
  "$MYSQLD" --no-defaults \
    --datadir="$DATADIR" \
    --basedir=/opt/anaconda3 \
    --lc-messages-dir=/opt/anaconda3/share/mysql/english \
    --socket="$SOCK" \
    --port="$PORT" \
    --pid-file="$PIDFILE" >"$ROOT/.localdb/mysqld.log" 2>&1 &
  for i in $(seq 1 30); do
    if "$MYSQL" --no-defaults -u root --socket="$SOCK" -e "SELECT 1" >/dev/null 2>&1; then break; fi
    sleep 0.5
  done
  echo "MySQL started."
fi

# 2. Start the PHP built-in web server (foreground).
echo "Serving at http://127.0.0.1:${HTTP_PORT}/flash.php  (Ctrl+C to stop the web server)"
exec "$PHP" -d display_errors=0 -d error_reporting=0 \
  -d mysqli.default_socket="$SOCK" \
  -S 127.0.0.1:"$HTTP_PORT" -t "$ROOT"
