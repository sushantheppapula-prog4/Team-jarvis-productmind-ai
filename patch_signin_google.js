const fs = require('fs');
const content = fs.readFileSync('app/(auth)/actions.ts', 'utf8');

let newContent = content.replace(
  'export async function signInWithGoogle() {',
  `export async function signInWithGoogle() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = headersList.get("origin") ?? \`\${protocol}://\${host}\`;`
);

newContent = newContent.replace(
  'const origin = (await headers()).get("origin") ?? "http://localhost:3000";',
  ''
);

fs.writeFileSync('app/(auth)/actions.ts', newContent);
console.log("Patched actions.ts");
