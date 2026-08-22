const fs = require('fs');
const content = fs.readFileSync('components/auth/auth-provider.tsx', 'utf8');

let newContent = content.replace(
  'if (error) {',
  'if (error && error.message !== "Auth session missing!") {'
);

fs.writeFileSync('components/auth/auth-provider.tsx', newContent);
console.log("AuthProvider patched");
