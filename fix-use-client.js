const fs = require('fs');
let c = fs.readFileSync('app/(routes)/page.tsx', 'utf8');
c = c.replace(/"use client";\nimport \{ ClyraLogoSymbol \} from "@\/components\/ui\/clyra-logo";\n"use client";/g, '"use client";\nimport { ClyraLogoSymbol } from "@/components/ui/clyra-logo";\n');
fs.writeFileSync('app/(routes)/page.tsx', c);
