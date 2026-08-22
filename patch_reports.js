const fs = require('fs');
const content = fs.readFileSync('app/(routes)/reports/actions.ts', 'utf8');

let newContent = content;

if (!newContent.includes('checkRateLimit')) {
  newContent = newContent.replace(
    'import { createClient } from "@/lib/supabase/server";',
    `import { createClient } from "@/lib/supabase/server";\nimport { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";`
  );
  
  newContent = newContent.replace(
    /export async function generateReport\([^)]+\)\s*\{/,
    match => `${match}\n  const rlContext = await getRateLimitContext();\n  const rl = await checkRateLimit("reports", rlContext);\n  if (!rl.success) return { error: "Too many report generation requests. Please try again later.", success: false };\n`
  );
}

fs.writeFileSync('app/(routes)/reports/actions.ts', newContent);
console.log("Reports actions patched");
