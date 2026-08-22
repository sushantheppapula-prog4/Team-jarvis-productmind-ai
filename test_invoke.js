const fs = require('fs');

const code = `
"use client";
import { signInWithGoogle } from "../actions";

export default function TestClient() {
  return (
    <button onClick={async () => {
      console.log("CLICKED!");
      try {
        await signInWithGoogle();
      } catch (e) {
        console.error(e);
      }
    }}>TEST</button>
  );
}
`;
fs.writeFileSync('app/(auth)/login/test-client.tsx', code);
