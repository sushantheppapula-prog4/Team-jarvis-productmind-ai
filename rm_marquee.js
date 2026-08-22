const fs = require('fs');

let code = fs.readFileSync('app/(routes)/page.tsx', 'utf8');

// The marquee ticker div starts with:
// {/* Marquee Ticker */}
// <div className="w-full overflow-hidden whitespace-nowrap bg-[#111111] py-2 text-[#F9F9F7] flex border-b-4 border-[#111111]">
// ...
// </div>

const regex = /\{\/\* Marquee Ticker \*\/\}.*?<\/div>\s*<\/div>/s;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('app/(routes)/page.tsx', code);
    console.log("Marquee ticker removed.");
} else {
    console.log("Marquee ticker not found.");
}
