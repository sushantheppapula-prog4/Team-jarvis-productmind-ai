const fs = require('fs');

let code = fs.readFileSync('components/layout/public-navbar.tsx', 'utf8');

// The file is a single line string mostly. We need to find the logo section.
// <Link href="/" className="flex items-center group">            <span className="font-serif text-3xl font-black tracking-tighter text-[#111111] uppercase">              Clyra            </span>          </Link>

const regex = /<Link href="\/" className="flex items-center group">\s*<span className="font-serif text-3xl font-black tracking-tighter text-\[#111111\] uppercase">\s*Clyra\s*<\/span>\s*<\/Link>/;

const newLogo = `<Link href="/" className="flex flex-col items-center justify-center group py-2">
            <ClyraLogoSymbol className="w-5 h-5 text-[#111111] mb-0.5" />
            <span className="font-serif text-[1.4rem] leading-none font-black tracking-tighter text-[#111111] uppercase">
              Clyra
            </span>
          </Link>`;

code = code.replace(regex, newLogo);

if (!code.includes('ClyraLogoSymbol')) {
    code = code.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils"; import { ClyraLogoSymbol } from "@/components/ui/clyra-logo"; ');
}

fs.writeFileSync('components/layout/public-navbar.tsx', code);
