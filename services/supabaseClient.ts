import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whdnkliyufiadwmvdmrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZG5rbGl5dWZpYWR3bXZkbXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDk5MDMsImV4cCI6MjA4NDMyNTkwM30.6sdjrvMPrLtPAgyy5rd-R9A9z9RjljCTdWIFxWShEmc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
