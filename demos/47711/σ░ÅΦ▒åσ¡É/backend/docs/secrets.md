# Local Secrets

Keep real API keys only in `backend/.env`. This file is ignored by `.gitignore`.

Set or rotate the Volcengine Ark key without showing it in terminal output:

```bash
cd backend
./scripts/setup_ark_key.sh
```

After pasting a key, restart the backend process so the app reloads `backend/.env`.

If a key was pasted into chat, screenshots, commits, or logs, revoke it in the Volcengine console and create a new one.

## SMS Verification

Set or rotate the Alibaba Cloud SMS verification config without showing secrets in terminal output:

```bash
cd backend
./scripts/setup_sms_config.sh
```

Required values:

- `ALIYUN_DYPNS_ACCESS_KEY_ID`
- `ALIYUN_DYPNS_ACCESS_KEY_SECRET`
- `ALIYUN_SMS_SIGN_NAME`
- `ALIYUN_SMS_TEMPLATE_REGISTER_LOGIN`
- `ALIYUN_SMS_TEMPLATE_RESET_PASSWORD`

Real SMS is used when access key, secret, and sign name are configured. `SMS_DEBUG_FALLBACK=false` disables local test codes.
