const fs = require('fs');
const content = fs.readFileSync('app/(routes)/chat/actions.ts', 'utf8');

let newContent = content;

if (!newContent.includes('checkRateLimit')) {
  newContent = newContent.replace(
    'import { createClient } from "@/lib/supabase/server";',
    `import { createClient } from "@/lib/supabase/server";\nimport { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";`
  );
  
  newContent = newContent.replace(
    /export async function sendMessage\([^)]+\)\s*\{/,
    match => `${match}\n  const rlContext = await getRateLimitContext();\n  const rl = await checkRateLimit("ai_analysis", rlContext);\n  if (!rl.success) return { error: "Too many chat messages. Please try again later.", success: false };\n`
  );
}

fs.writeFileSync('app/(routes)/chat/actions.ts', newContent);
console.log("Chat actions patched");
