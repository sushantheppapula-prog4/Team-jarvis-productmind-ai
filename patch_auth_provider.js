const fs = require('fs');
const content = fs.readFileSync('components/auth/auth-provider.tsx', 'utf8');

let newContent = content.replace(
  'void supabase.auth.getUser().then(({ data: { user } }) => {',
  `void supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Supabase auth error:", error);
      }`
);

fs.writeFileSync('components/auth/auth-provider.tsx', newContent);
console.log("AuthProvider patched");
