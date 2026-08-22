const fs = require('fs');

const code = `
"use server";
import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  console.log("TESTING REDIRECT");
  redirect("https://google.com");
}
`;
fs.writeFileSync('app/(auth)/actions.ts', code);
