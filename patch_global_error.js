const fs = require('fs');

try {
  fs.unlinkSync('app/global-error.tsx');
  console.log('Removed global-error.tsx');
} catch(e) {
  console.log('No global-error.tsx to remove');
}

