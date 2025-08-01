import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oeimweqnlcjykojkmqut.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9laW13ZXFubGNqeWtvamttcXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzE1NzIsImV4cCI6MjA2OTY0NzU3Mn0.kA7KMr3cbbaE4iQ9armdA0evXLAJ9XBhdg4QeGjMqFM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);