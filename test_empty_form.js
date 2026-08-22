const fs = require('fs');

const code = `
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "../actions";

export default function Page() {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="dummy" value="1" />
      <Button type="submit">Google</Button>
    </form>
  )
}
`;
fs.writeFileSync('app/(auth)/login/page.tsx', code);
