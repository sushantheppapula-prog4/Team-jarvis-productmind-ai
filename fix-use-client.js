const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.startsWith('"use client";import')) {
    content = content.replace(/^"use client";import/, '"use client";\nimport');
    fs.writeFileSync(file, content);
    count++;
  } else if (content.startsWith('"use client"; import')) {
    content = content.replace(/^"use client"; import/, '"use client";\nimport');
    fs.writeFileSync(file, content);
    count++;
  } else if (content.startsWith('"use client" import')) {
    content = content.replace(/^"use client" import/, '"use client";\nimport');
    fs.writeFileSync(file, content);
    count++;
  }
});
console.log(`Fixed ${count} files.`);
