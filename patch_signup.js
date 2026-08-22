const fs = require('fs');
const content = fs.readFileSync('app/(auth)/actions.ts', 'utf8');

let newContent = content.replace(
  'export async function signUp(formData: FormData) {',
  `export async function signUp(formData: FormData) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = headersList.get("origin") ?? \`\${protocol}://\${host}\`;`
);

newContent = newContent.replace(
  'const origin = (await headers()).get("origin") ?? "";',
  ''
);

fs.writeFileSync('app/(auth)/actions.ts', newContent);
console.log("Patched actions.ts signup");
