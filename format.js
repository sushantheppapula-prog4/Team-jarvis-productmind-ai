const fs = require('fs');
let c = fs.readFileSync('app/(routes)/layout.tsx', 'utf8');
if (c.includes('"use client";import')) {
  c = c.replace(/"use client";import/g, '"use client";\nimport');
  fs.writeFileSync('app/(routes)/layout.tsx', c);
  console.log("Fixed layout");
}
