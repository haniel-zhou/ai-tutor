/**
 * Supabase 客户端
 *
 * 提供两个客户端:
 * - server: 服务端用,使用 service_role_key,可以绕过 RLS
 * - client: 浏览器用,使用 anon_key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables');
}

// 浏览器客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端客户端(API routes 用,有 service_role 权限)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
