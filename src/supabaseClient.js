import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvbcvcwarbrgzrjgkcxv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YmN2Y3dhcmJyZ3pyamdrY3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjYzMzcsImV4cCI6MjEwNjEwMjMzN30.DkTxhGYrxoW8TcXej93HEC2w8Qsn9DpYw4tkSb7_wmY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);