# Clyra Signup Authentication Verification

## Result

The signup “FETCH FAILED” issue was traced to the local Clyra development command, not to the Newsprint UI, Supabase schema, or the signup form. The `dev` script explicitly unset `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` before starting Next.js. Both Supabase clients then fell back to `https://placeholder.supabase.co` and `placeholder_key`, so authentication requests could not reach the confirmed Clyra project.

## Minimal fix

Only `package.json` was changed for the signup issue. The development script now starts Next.js without stripping the required public Supabase variables:

```json
"dev": "next dev -p 3000 -H 0.0.0.0"
```

No auth action rewrite, database change, UI redesign, ProductForm change, Phase 1 change, or Phase 2 change was made for this fix.

## Runtime evidence

| Test | Status | Evidence |
|---|---|---|
| Clyra Supabase project | PASS | Requests targeted `https://ipsuqiutskpnqgxpestz.supabase.co` only. |
| Signup page loads | PASS | Local Clyra `/sign-up` returned HTTP 200 and rendered “Create Account” with the Newsprint layout. |
| Supabase auth configuration | PASS | Clyra `/auth/v1/settings` returned HTTP 200; email signup was enabled and autoconfirm was enabled. |
| Signup network reachability | PASS | A deliberately invalid signup request reached Clyra Supabase and returned HTTP 400 rather than a placeholder-host/network failure. |
| Successful registration | PASS | An authorized disposable Clyra Auth account was created through the confirmed Clyra Supabase project; response contained a user, access token, and confirmed email state. Credentials were not printed. |
| Login | PASS | The same disposable account authenticated successfully; response contained a user, bearer token, and no error. Tokens were not printed. |
| Failed signup handling | PASS | The invalid request produced a server validation response; the existing server action redirects Supabase errors to `/sign-up?error=...` rather than displaying a generic placeholder fetch failure. |
| Gemini exposure | PASS | No `NEXT_PUBLIC_GEMINI` variable exists in source; Gemini remains server-side under `GEMINI_API_KEY`. |
| TypeScript | PASS | `npx tsc --noEmit --incremental false` exited 0. |
| `git diff --check` | PASS | Exited 0. |
| Production build | PASS | `npm run build` exited 0 and generated the Clyra routes, including `/sign-up`, `/login`, and `/dashboard`. |
| Newsprint UI | PASS | No visual files were changed for the auth fix; the signup page continues to use the Clyra Newsprint tokens and layout. |
| ProductMind Ai | PASS | ProductMind Ai was not accessed or modified. |

## Remaining deployment requirement

The same three variables must be configured in the actual Clyra deployment environment. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are public client variables and must point to the Clyra project. `GEMINI_API_KEY` must be configured as a server-only variable and must never be prefixed with `NEXT_PUBLIC_` or exposed in browser code.

The previously pasted Gemini key should be revoked and replaced because it was exposed in chat. The replacement key was not requested, displayed, or stored by this verification.
