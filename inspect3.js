const fs = require('fs');
const content = fs.readFileSync('.next/server/chunks/190.js', 'utf8');
const pos = 13922;
console.log(content.substring(pos - 150, pos + 150));
