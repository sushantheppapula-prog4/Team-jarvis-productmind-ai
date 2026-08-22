const fs = require('fs');

try {
  fs.rmSync('pages', { recursive: true, force: true });
  console.log('Removed pages directory');
} catch (e) {
  console.log('No pages directory');
}
