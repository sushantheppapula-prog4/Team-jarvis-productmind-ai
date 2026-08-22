const fs = require('fs');
const content = fs.readFileSync('.next/server/chunks/892.js', 'utf8');
const pos = 21384;
console.log(content.substring(pos - 150, pos + 150));
