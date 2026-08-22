const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

// Replace standard html tag with basic div to trick the pages router bug, 
// since we already forced dynamic rendering everywhere.
content = content.replace(/<html lang="en" suppressHydrationWarning>/g, '<div id="root-html" lang="en">');
content = content.replace(/<\/html>/g, '</div>');

fs.writeFileSync('app/layout.tsx', content);
console.log('Replaced html tag with div in root layout');
