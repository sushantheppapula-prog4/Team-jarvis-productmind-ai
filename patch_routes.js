const fs = require('fs');

function enforceDynamic(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = `${dir}/${file}`;
    if (fs.statSync(fullPath).isDirectory()) {
      enforceDynamic(fullPath);
    } else if (file === 'page.tsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('export const dynamic')) {
         fs.writeFileSync(fullPath, 'export const dynamic = "force-dynamic";\n' + content);
      }
    }
  }
}

enforceDynamic('app/(routes)');
console.log('Forced dynamic on all routes');
