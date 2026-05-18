#!/usr/bin/env bash
# Push local env files to Vercel.
#
#   prod  →  .env.production   →  Vercel "production"  (CLI)
#   dev   →  .env.development  →  Vercel "preview" + "development" (API; CLI preview has git-branch bug)
#
# Usage:
#   ./scripts/push-env-to-vercel.sh prod
#   ./scripts/push-env-to-vercel.sh dev
#   ./scripts/push-env-to-vercel.sh prod dev
#
# Requires: pnpm, linked project (.vercel/project.json), vercel login, curl, node

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DRY_RUN=0
DO_PROD=0
DO_DEV=0

SENSITIVE_KEYS="KINDE_CLIENT_SECRET|MONGODB_URI"

usage() {
  cat <<'EOF'
Push environment variables from local .env files to Vercel.

  prod  →  .env.production   →  production
  dev   →  .env.development  →  preview + development

Usage:
  ./scripts/push-env-to-vercel.sh prod [dev] [--dry-run]
  pnpm env:push prod
  pnpm env:push dev

Options:
  prod, --prod       Push .env.production to Vercel production
  dev, --dev         Push .env.development to preview and development
  --dry-run          Print keys only; do not call Vercel
  -h, --help         Show this help

Prerequisites:
  pnpm vercel login
  .vercel/project.json (pnpm vercel:link)
EOF
}

is_sensitive() {
  local key="$1"
  [[ "$key" =~ ^(${SENSITIVE_KEYS})$ ]]
}

supports_sensitive_flag() {
  local vercel_target="$1"
  [[ "$vercel_target" == "production" || "$vercel_target" == "preview" ]]
}

run_vercel() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec vercel "$@"
  else
    vercel "$@"
  fi
}

load_vercel_config() {
  if [[ ! -f .vercel/project.json ]]; then
    echo "error: project not linked. Run: pnpm vercel:link" >&2
    exit 1
  fi

  PROJECT_ID="$(node -pe "JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')).projectId")"
  TEAM_ID="$(node -pe "JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')).orgId")"

  local auth_file=""
  for candidate in \
    "$HOME/Library/Application Support/com.vercel.cli/auth.json" \
    "$HOME/.local/share/com.vercel.cli/auth.json"; do
    if [[ -f "$candidate" ]]; then
      auth_file="$candidate"
      break
    fi
  done

  if [[ -z "$auth_file" ]]; then
    echo "error: not logged in. Run: pnpm vercel login" >&2
    exit 1
  fi

  VERCEL_TOKEN="$(node -pe "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).token" "$auth_file")"
}

add_env_via_api() {
  local key="$1"
  local value="$2"
  local vercel_target="$3"
  local sensitive="$4"

  local env_type="plain"
  if [[ "$sensitive" == "1" ]]; then
    env_type="encrypted"
  fi

  local payload
  payload="$(node -e "
    const payload = {
      key: process.argv[1],
      value: process.argv[2],
      type: process.argv[3],
      target: [process.argv[4]],
      gitBranch: null,
    };
    console.log(JSON.stringify(payload));
  " "$key" "$value" "$env_type" "$vercel_target")"

  local response http_code
  response="$(curl -sS -w '\n%{http_code}' -X POST \
    "https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$payload")"

  http_code="${response##*$'\n'}"
  response="${response%$'\n'*}"

  if [[ "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
    echo "error: API failed for $key ($vercel_target) HTTP $http_code" >&2
    echo "$response" >&2
    exit 1
  fi
}

add_env_via_cli() {
  local key="$1"
  local value="$2"
  local vercel_target="$3"

  if is_sensitive "$key" && supports_sensitive_flag "$vercel_target"; then
    run_vercel env add "$key" "$vercel_target" --value "$value" --force --yes --sensitive
  else
    run_vercel env add "$key" "$vercel_target" --value "$value" --force --yes </dev/null
  fi
}

push_file() {
  local env_file="$1"
  local vercel_target="$2"
  local mode="$3" # cli | api

  if [[ ! -f "$env_file" ]]; then
    echo "error: missing $env_file" >&2
    exit 1
  fi

  echo "→ $env_file → Vercel ($vercel_target) [$mode]"

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    [[ -z "$key" ]] && continue

    local sensitive=0
    is_sensitive "$key" && sensitive=1

    if [[ "$DRY_RUN" -eq 1 ]]; then
      if [[ "$sensitive" -eq 1 ]]; then
        echo "  [dry-run] $key (encrypted)"
      else
        echo "  [dry-run] $key"
      fi
      continue
    fi

    if [[ "$mode" == "api" ]]; then
      add_env_via_api "$key" "$value" "$vercel_target" "$sensitive"
    else
      add_env_via_cli "$key" "$value" "$vercel_target"
    fi
    echo "  ✓ $key"
  done < "$env_file"

  echo "done: $env_file → $vercel_target"
  run_vercel env ls "$vercel_target"
}

for arg in "$@"; do
  case "$arg" in
    prod|--prod) DO_PROD=1 ;;
    dev|--dev) DO_DEV=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "$DO_PROD" -eq 0 && "$DO_DEV" -eq 0 ]]; then
  usage >&2
  exit 1
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  load_vercel_config
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "dry-run mode (no values sent to Vercel)"
fi

[[ "$DO_PROD" -eq 1 ]] && push_file ".env.production" "production" "cli"
if [[ "$DO_DEV" -eq 1 ]]; then
  push_file ".env.development" "preview" "api"
  push_file ".env.development" "development" "api"
fi

echo "All requested environments pushed."
