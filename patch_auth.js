const fs = require('fs');
const content = fs.readFileSync('app/(auth)/actions.ts', 'utf8');

let newContent = content.replace(
  'import { createClient } from "@/lib/supabase/server";',
  `import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";`
);

newContent = newContent.replace(
  'export async function signIn(formData: FormData) {',
  `export async function signIn(formData: FormData) {
  const rlContext = await getRateLimitContext();
  const rl = await checkRateLimit("login", rlContext);
  if (!rl.success) redirect(authErrorPath("/login", "Too many login attempts. Please try again later."));
`
);

newContent = newContent.replace(
  'export async function signUp(formData: FormData) {',
  `export async function signUp(formData: FormData) {
  const rlContext = await getRateLimitContext();
  const rl = await checkRateLimit("signup", rlContext);
  if (!rl.success) redirect(authErrorPath("/sign-up", "Too many signup attempts. Please try again later."));
`
);

fs.writeFileSync('app/(auth)/actions.ts', newContent);
console.log("Auth actions patched");
