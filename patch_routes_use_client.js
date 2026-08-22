const fs = require('fs');

function fixDirectives(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = `${dir}/${file}`;
    if (fs.statSync(fullPath).isDirectory()) {
      fixDirectives(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If it contains both, "use client" must be first
      if (content.includes('"use client";') && content.includes('export const dynamic')) {
         // Strip all instances of use client
         content = content.replace(/"use client";\n?/g, '');
         content = content.replace(/'use client';\n?/g, '');
         
         // Prepend use client to the absolute top
         content = '"use client";\n' + content;
         fs.writeFileSync(fullPath, content);
      }
    }
  }
}

fixDirectives('app/(routes)');
console.log('Fixed use client order');
