
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whdnkliyufiadwmvdmrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZG5rbGl5dWZpYWR3bXZkbXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDk5MDMsImV4cCI6MjA4NDMyNTkwM30.6sdjrvMPrLtPAgyy5rd-R9A9z9RjljCTdWIFxWShEmc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdminRole() {
    const email = 'resumovetorial@gmail.com';
    console.log(`Checking role for ${email}...`);

    // 1. Get User ID by signing in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'Zrci872@'
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log(`User ID: ${userId}`);

    // 2. Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError.message);

        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
            console.log('Profile not found. Creating...');
            const { error: insertError } = await supabase
                .from('profiles')
                .insert([{ id: userId, full_name: 'Admin Vetorial', role: 'admin' }]);

            if (insertError) console.error('Error creating profile:', insertError.message);
            else console.log('Profile created with admin role.');
        }
        return;
    }

    console.log('Current Profile Role:', profile.role);

    // 3. Update Role if needed
    if (profile.role !== 'admin') {
        console.log('Updating role to admin...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating role:', updateError.message);
        } else {
            console.log('Role updated successfully to admin.');
        }
    } else {
        console.log('User already has admin role.');
    }
}

fixAdminRole();
