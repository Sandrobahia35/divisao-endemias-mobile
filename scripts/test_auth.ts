
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whdnkliyufiadwmvdmrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZG5rbGl5dWZpYWR3bXZkbXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDk5MDMsImV4cCI6MjA4NDMyNTkwM30.6sdjrvMPrLtPAgyy5rd-R9A9z9RjljCTdWIFxWShEmc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'resumovetorial@gmail.com';
const password = 'Zrci872@';

async function checkAuth() {
    console.log(`Checking auth for ${email}...`);

    // 1. Try Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (!loginError && loginData.user) {
        console.log('SUCCESS: Login successful! User exists and password is correct.', loginData.user.id);
        return;
    }

    console.log('Login failed:', loginError?.message);

    if (loginError?.message === 'Email not confirmed') {
        console.log('DIAGNOSIS: Email is not confirmed. User needs to check inbox.');
        return;
    }

    // 2. Try Signup
    console.log('Attempting Signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Admin Vetorial' }
        }
    });

    if (!signupError && signupData.user) {
        // Check if user is created or if it created but needs confirmation
        if (signupData.user.identities?.length === 0) {
            console.log('DIAGNOSIS: User already registered (but login failed). Likely wrong password or unconfirmed.');
        } else {
            console.log('SUCCESS: User was NOT registered. I just created it.');
            console.log('STATUS: Confirmation email sent? ', !signupData.session);
        }
    } else {
        console.log('Signup failed:', signupError?.message);
    }
}

checkAuth();
