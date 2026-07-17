#!/usr/bin/env bash
set -euo pipefail

cd /home/deploy/exerciselog-prod
set -a
source .env.backup
set +a

rclone copy r2-uploads:exerciselog r2-backups:exerciselog-backups/uploads

curl -fsS -m 10 --retry 3 "$HC_PING_URL_UPLOADS" > /dev/null


echo "Uploads backup OK"