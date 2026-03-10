import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode(len = 6) {
  return Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

serve(async (req) => {
  try {
    const { display_name, category, rounds = 8, timer_seconds = 15, difficulty = 'mixed' } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    let code, exists = true;
    while (exists) {
      code = generateCode();
      const { data } = await supabase.from('rooms').select('id').eq('code', code).single();
      exists = !!data;
    }

    const { data: room, error } = await supabase.from('rooms').insert({
      code, host_id: user.id, category, rounds, timer_seconds, difficulty, status: 'waiting'
    }).select().single();
    if (error) throw error;

    await supabase.from('room_players').insert({
      room_id: room.id, user_id: user.id, display_name, join_order: 1, is_ready: true
    });

    return new Response(JSON.stringify({ room_id: room.id, code: room.code }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
