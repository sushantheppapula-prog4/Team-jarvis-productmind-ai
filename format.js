const fs = require('fs');

let code = fs.readFileSync('components/layout/public-navbar.tsx', 'utf8');

const logoTarget = `{/* Logo */}          <Link href="/" className="flex items-center group">            <span className="font-serif text-3xl font-black tracking-tighter text-[#111111] uppercase">              Clyra            </span>          </Link>`;

const newLogo = `{/* Logo */}
          <Link href="/" className="flex flex-col items-center justify-center group py-2">
            <ClyraLogoSymbol className="w-5 h-5 text-[#111111] mb-0.5" />
            <span className="font-serif text-[1.4rem] leading-none font-black tracking-tighter text-[#111111] uppercase">
              Clyra
            </span>
          </Link>`;

code = code.replace(logoTarget, newLogo);

const importStatement = `import { ClyraLogoSymbol } from "@/components/ui/clyra-logo";\n`;
if (!code.includes('ClyraLogoSymbol')) {
    code = code.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\n' + importStatement);
}

fs.writeFileSync('components/layout/public-navbar.tsx', code);
