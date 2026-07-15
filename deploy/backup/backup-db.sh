#!/usr/bin/env bash
set -euo pipefail

cd /home/deploy/exerciselog-prod
set -a
source .env.backup
set +a

STAMP=$(date +%F_%H-%M)
FILE="exerciselog-db-${STAMP}".dump.age

docker run --rm -e DATABASE_URL_DIRECT postgres:17-alpine \
  sh -c 'pg_dump "$DATABASE_URL_DIRECT" -Fc' \
  | age -r "$AGE_RECIPIENT" -o "/tmp/${FILE}"

rclone copy "/tmp/${FILE}" r2-backups:exerciselog-backups/db/
rm "/tmp/${FILE}"

curl -fsS -m 10 --retry 3 "$HC_PING_URL" > /dev/null

echo "Backup OK: ${FILE}" 