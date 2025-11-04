import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 SUPABASE CLIENT: Configurando cliente...');
console.log('🔧 SUPABASE URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('🔧 SUPABASE KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ SUPABASE CLIENT: Cliente criado com persistência habilitada');

