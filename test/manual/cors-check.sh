#!/usr/bin/env bash
# Manual CORS evidence script for Activity 4 (Use CORS methodology).
# No frontend needed: curl plays the role of "a client on another origin"
# by sending the Origin header a real cross-origin browser request would send.
# The API's response headers (Access-Control-Allow-*) are what prove CORS is working.
#
# Usage:
#   API_URL=http://localhost:3000 ALLOWED_ORIGIN=http://localhost:5173 \
#   BLOCKED_ORIGIN=http://evil.example ./test/manual/cors-check.sh
#
# Run from the repo root once the API is up (docker compose up, or npm run dev).

set -uo pipefail

API_URL="${API_URL:-http://localhost:3000}"
ALLOWED_ORIGIN="${ALLOWED_ORIGIN:-http://localhost:5173}"   # must be in CORS_ORIGINS
BLOCKED_ORIGIN="${BLOCKED_ORIGIN:-http://evil.example}"      # must NOT be in CORS_ORIGINS
EMAIL="${EMAIL:-manager@trattoria.test}"
PASSWORD="${PASSWORD:-Manager123!}"

hr() { printf '\n\033[1;36m== %s ==\033[0m\n' "$1"; }

hr "0. Log in to get a JWT (not a CORS test, just fetching a token to use below)"
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | \
  node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{console.log(JSON.parse(d).token||"")}catch{console.log("")}})')
if [ -z "$TOKEN" ]; then
  echo "Could not obtain a token — is the API running and seeded? (npm run db:seed)"
  exit 1
fi
echo "Token acquired."

hr "1. GET /api/categories — simple request, allowed origin"
curl -s -D - -o /dev/null "$API_URL/api/categories" \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Authorization: Bearer $TOKEN" | grep -i -E "^(HTTP|access-control)"

hr "2. GET /api/categories — same request, DISALLOWED origin"
echo "(server still answers — CORS is enforced by the browser reading the response,"
echo " but note Access-Control-Allow-Origin is now absent, which is what a real browser checks)"
curl -s -D - -o /dev/null "$API_URL/api/categories" \
  -H "Origin: $BLOCKED_ORIGIN" \
  -H "Authorization: Bearer $TOKEN" | grep -i -E "^(HTTP|access-control)"

hr "3. Preflight OPTIONS for POST /api/categories (allowed origin)"
curl -s -D - -o /dev/null -X OPTIONS "$API_URL/api/categories" \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" | grep -i -E "^(HTTP|access-control)"

hr "4. Actual POST /api/categories (allowed origin)"
curl -s -D - -o /dev/null -X POST "$API_URL/api/categories" \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"CORS test category"}' | grep -i -E "^(HTTP|access-control)"

hr "5. Preflight OPTIONS for PUT /api/bookings/:id (allowed origin)"
curl -s -D - -o /dev/null -X OPTIONS "$API_URL/api/bookings/00000000-0000-0000-0000-000000000000" \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" | grep -i -E "^(HTTP|access-control)"

hr "6. Preflight OPTIONS for DELETE /api/categories/:id (allowed origin)"
curl -s -D - -o /dev/null -X OPTIONS "$API_URL/api/categories/00000000-0000-0000-0000-000000000000" \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Access-Control-Request-Method: DELETE" \
  -H "Access-Control-Request-Headers: Authorization" | grep -i -E "^(HTTP|access-control)"

hr "7. Preflight OPTIONS, DISALLOWED origin (should come back without Access-Control-Allow-Origin)"
curl -s -D - -o /dev/null -X OPTIONS "$API_URL/api/categories" \
  -H "Origin: $BLOCKED_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" | grep -i -E "^(HTTP|access-control)"

hr "Done — capture this terminal output (or redirect it: ./cors-check.sh > cors-evidence.txt) as evidence for the trainer."
