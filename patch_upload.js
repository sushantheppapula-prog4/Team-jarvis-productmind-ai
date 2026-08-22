const fs = require('fs');
const content = fs.readFileSync('app/(routes)/upload/actions.ts', 'utf8');

let newContent = content;

if (!newContent.includes('checkRateLimit')) {
  newContent = newContent.replace(
    'import { createClient } from "@/lib/supabase/server";',
    `import { createClient } from "@/lib/supabase/server";\nimport { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";`
  );
  
  newContent = newContent.replace(
    /export async function uploadFeedback\([^)]+\)\s*\{/,
    match => `${match}\n  const rlContext = await getRateLimitContext();\n  const rl = await checkRateLimit("upload", rlContext);\n  if (!rl.success) return { error: "Too many upload requests. Please try again later.", success: false };\n`
  );

  newContent = newContent.replace(
    /export async function analyzeFeedback\([^)]+\)\s*\{/,
    match => `${match}\n  const rlContext = await getRateLimitContext();\n  const rl = await checkRateLimit("ai_analysis", rlContext);\n  if (!rl.success) return { error: "Too many AI analysis requests. Please try again later.", success: false };\n`
  );
}

fs.writeFileSync('app/(routes)/upload/actions.ts', newContent);
console.log("Upload actions patched");
