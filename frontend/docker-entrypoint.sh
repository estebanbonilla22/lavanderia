#!/bin/sh
set -e

: "${AUTH_API_URL:=http://localhost:8081}"
: "${LAUNDRY_API_URL:=http://localhost:8082}"
: "${ORDER_API_URL:=http://localhost:8083}"

export AUTH_API_URL LAUNDRY_API_URL ORDER_API_URL

envsubst '${AUTH_API_URL} ${LAUNDRY_API_URL} ${ORDER_API_URL}' \
  < /usr/share/nginx/html/env.template.js \
  > /usr/share/nginx/html/env.js

INDEX=/usr/share/nginx/html/index.html
if ! grep -q '/env.js' "$INDEX"; then
  sed -i 's#</head>#<script src="/env.js"></script></head>#' "$INDEX"
fi

exec "$@"
