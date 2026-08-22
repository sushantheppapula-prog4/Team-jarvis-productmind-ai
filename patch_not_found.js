const fs = require('fs');
fs.unlinkSync('app/not-found.tsx');
fs.unlinkSync('app/error.tsx');
console.log('Removed error pages');
