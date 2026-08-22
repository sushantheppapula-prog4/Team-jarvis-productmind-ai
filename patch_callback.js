const fs = require('fs');
const content = fs.readFileSync('app/auth/callback/route.ts', 'utf8');

let newContent = content.replace(
  'export async function GET(request: NextRequest) {',
  `export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = \`\${protocol}://\${host}\`;`
);

newContent = newContent.replace(
  /new URL\(next, request\.url\)/g,
  'new URL(next, origin)'
);

newContent = newContent.replace(
  /new URL\("\/login\?error=Could%20not%20authenticate%20user%20via%20Google\.", request\.url\)/g,
  'new URL("/login?error=Could%20not%20authenticate%20user%20via%20Google.", origin)'
);

fs.writeFileSync('app/auth/callback/route.ts', newContent);
console.log("Patched route.ts callback");
