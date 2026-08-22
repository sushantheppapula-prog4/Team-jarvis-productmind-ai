const fs = require('fs');
const content = fs.readFileSync('.next/server/chunks/488.js', 'utf8');
const pos = 13388;
console.log(content.substring(pos - 150, pos + 150));
