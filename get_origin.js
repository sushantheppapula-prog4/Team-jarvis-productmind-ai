const fs = require('fs');
const content = fs.readFileSync('app/(auth)/actions.ts', 'utf8');

console.log(content.match(/export async function signInWithGoogle[\s\S]*?}/)[0]);
