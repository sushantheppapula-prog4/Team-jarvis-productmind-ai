const fs = require('fs');

let code = fs.readFileSync('app/(routes)/page.tsx', 'utf8');

const target = `            <div className="aspect-[4/3] w-full border border-[#111111] mb-6 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-20 [background-size:16px_16px] grayscale hover:sepia-[50%] transition-all duration-500" />`;

const replacement = `            <div className="relative aspect-[4/3] w-full border border-[#111111] mb-6 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-20 [background-size:16px_16px] grayscale hover:sepia-[50%] transition-all duration-500" />
              {/* Floating Logo */}
              <div className="relative z-10 drop-shadow-md">
                <ClyraLogoSymbol className="w-20 h-20 text-[#111111]" />
              </div>
            </div>`;

code = code.replace(target, replacement);

const importStatement = `import { ClyraLogoSymbol } from "@/components/ui/clyra-logo";\n`;
if (!code.includes('ClyraLogoSymbol')) {
    code = code.replace('import { PublicNavbar } from "@/components/layout/public-navbar";', 'import { PublicNavbar } from "@/components/layout/public-navbar";\n' + importStatement);
}

fs.writeFileSync('app/(routes)/page.tsx', code);
