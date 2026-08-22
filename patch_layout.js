const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

content = content.replace(/<div id="root-html" lang="en">/g, '<html lang="en" suppressHydrationWarning>');
content = content.replace(/<\/div>$/g, '</html>'); // Be careful here, it's at the end
content = content.replace(/<\/div>/g, '</html>'); 

fs.writeFileSync('app/layout.tsx', content);
