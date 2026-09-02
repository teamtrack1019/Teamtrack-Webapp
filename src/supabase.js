import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'teamtrack_supabase_url';
const SUPABASE_ANON_KEY = 'teamtrack_supabase_anon_key';

export function getSupabaseConfig() {
  try {
    const url = localStorage.getItem(SUPABASE_URL_KEY) || '';
    const anonKey = localStorage.getItem(SUPABASE_ANON_KEY) || '';
    return { url, anonKey };
  } catch (e) {
    return { url: '', anonKey: '' };
  }
}

export function saveSupabaseConfig(url, anonKey) {
  try {
    if (url && anonKey) {
      localStorage.setItem(SUPABASE_URL_KEY, url.trim());
      localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(SUPABASE_URL_KEY);
      localStorage.removeItem(SUPABASE_ANON_KEY);
    }
  } catch (e) {}
}

let supabaseInstance = null;

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    supabaseInstance = null;
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: { persistSession: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

export async function testSupabaseConnection(url, anonKey) {
  try {
    if (!url || !anonKey) throw new Error('Bitte URL und Anon Key eingeben.');
    const testClient = createClient(url.trim(), anonKey.trim());
    
    // Quick probe query
    const { error } = await testClient.from('teamtrack_sync').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // 42P01 means table does not exist yet which is fine, we can auto-create
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
        throw new Error('Ungültiger Anon Key / API Key.');
      }
    }
    return { success: true, message: 'Verbindung zu Supabase erfolgreich!' };
  } catch (err) {
    return { success: false, message: err.message || 'Verbindung fehlgeschlagen.' };
  }
}

// SQL Schema for the user to run in Supabase SQL Editor if they want dedicated tables,
// or we use a flexible unified cloud sync table `teamtrack_store` (key, data).
export const SUPABASE_SETUP_SQL = `-- TeamTrack Cloud Database Schema (PostgreSQL / Supabase)
-- In Supabase -> SQL Editor -> New query -> Paste & Run

CREATE TABLE IF NOT EXISTS teamtrack_store (
  id TEXT PRIMARY KEY DEFAULT 'main_workspace',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE teamtrack_store ENABLE ROW LEVEL SECURITY;

-- Allow public access for this workspace (or customize for your team)
CREATE POLICY "Allow full access to teamtrack_store" 
ON teamtrack_store 
FOR ALL 
USING (true) 
WITH CHECK (true);
`;
