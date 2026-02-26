#!/usr/bin/env bash
# Test sign-in: replace with a user that exists (create via signup first).
# Usage: ./test-signin.sh   or   bash test-signin.sh

BASE_URL="${BASE_URL:-http://localhost:4001}"

curl -X POST "${BASE_URL}/api/v1/user/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manassisodia3@gmail.com",
    "password": "Manas24"
  }' \
  -c cookies.txt \
  -w "\n\nHTTP Status: %{http_code}\n"
