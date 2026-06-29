#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${BACKEND_DIR}/.env"
EXAMPLE_FILE="${BACKEND_DIR}/.env.example"

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${EXAMPLE_FILE}" "${ENV_FILE}"
fi

read_secret() {
  local prompt="$1"
  local value
  printf "%s" "${prompt}"
  stty -echo
  read -r value
  stty echo
  printf "\n"
  printf "%s" "${value}"
}

read_value() {
  local prompt="$1"
  local value
  printf "%s" "${prompt}"
  read -r value
  printf "%s" "${value}"
}

ACCESS_KEY_ID="$(read_secret 'Paste ALIYUN_DYPNS_ACCESS_KEY_ID. Input will be hidden: ')"
ACCESS_KEY_SECRET="$(read_secret 'Paste ALIYUN_DYPNS_ACCESS_KEY_SECRET. Input will be hidden: ')"
SIGN_NAME="$(read_value 'Paste ALIYUN_SMS_SIGN_NAME: ')"
REGISTER_TEMPLATE="$(read_value 'Paste register/login template code [100001]: ')"
RESET_TEMPLATE="$(read_value 'Paste reset-password template code [100003]: ')"

if [[ -z "${ACCESS_KEY_ID}" || -z "${ACCESS_KEY_SECRET}" || -z "${SIGN_NAME}" ]]; then
  echo "Required SMS config was empty; no changes made."
  exit 1
fi

REGISTER_TEMPLATE="${REGISTER_TEMPLATE:-100001}"
RESET_TEMPLATE="${RESET_TEMPLATE:-100003}"

TMP_FILE="$(mktemp)"
awk \
  -v key_id="${ACCESS_KEY_ID}" \
  -v key_secret="${ACCESS_KEY_SECRET}" \
  -v sign_name="${SIGN_NAME}" \
  -v register_tpl="${REGISTER_TEMPLATE}" \
  -v reset_tpl="${RESET_TEMPLATE}" '
  BEGIN {
    keys["ALIYUN_DYPNS_ACCESS_KEY_ID"]="ALIYUN_DYPNS_ACCESS_KEY_ID=" key_id
    keys["ALIYUN_DYPNS_ACCESS_KEY_SECRET"]="ALIYUN_DYPNS_ACCESS_KEY_SECRET=" key_secret
    keys["ALIYUN_SMS_SIGN_NAME"]="ALIYUN_SMS_SIGN_NAME=" sign_name
    keys["ALIYUN_SMS_TEMPLATE_REGISTER_LOGIN"]="ALIYUN_SMS_TEMPLATE_REGISTER_LOGIN=" register_tpl
    keys["ALIYUN_SMS_TEMPLATE_RESET_PASSWORD"]="ALIYUN_SMS_TEMPLATE_RESET_PASSWORD=" reset_tpl
    keys["SMS_DEBUG_FALLBACK"]="SMS_DEBUG_FALLBACK=false"
  }
  {
    split($0, parts, "=")
    name = parts[1]
    if (name in keys) {
      print keys[name]
      seen[name] = 1
      next
    }
    print
  }
  END {
    for (name in keys) {
      if (!seen[name]) print keys[name]
    }
  }
' "${ENV_FILE}" > "${TMP_FILE}"

mv "${TMP_FILE}" "${ENV_FILE}"
chmod 600 "${ENV_FILE}"

echo "Saved SMS config to backend/.env with SMS_DEBUG_FALLBACK=false."
echo "Restart the backend process so the app reloads backend/.env."
