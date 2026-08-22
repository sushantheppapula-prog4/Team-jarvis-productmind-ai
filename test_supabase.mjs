import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://epfsvwhoggwjpwmupxaz.supabase.co";
const supabaseKey = "sb_publishable_ZxXuymAmW_3CxJzDr1M02Q_OKq9XWwS";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing signInWithOAuth...");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    }
  });

  console.log("Data:", data);
  console.log("Error:", error);
}

test();
