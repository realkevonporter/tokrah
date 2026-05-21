import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import 'expo-sqlite/localStorage/install';
import { getToken } from '../securestore/auth.securestore';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL! ?? "https://smvgctdqokjjzjvbuxnc.supabase.co"
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ?? "sb_publishable_1cLKHcOUtBYu0aDtMfPQWw_zW5ee7OS"

export const setSupabaseAuth = async (token: string) => {
  supabase.auth.setSession({
    access_token: token,
    refresh_token: token, // dummy, since you're handling refresh yourself
  });
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey)