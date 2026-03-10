import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { room_code, display_name } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { data: room } = await supabase.from('rooms')
      .select('*').eq('code', room_code.toUpperCase()).eq('status', 'waiting').single();
    if (!room) return new Response(JSON.stringify({ error: 'Room not found or already started' }), { status: 404, headers: corsHeaders });

    const { count } = await supabase.from('room_players')
      .select('*', { count: 'exact', head: true }).eq('room_id', room.id);
    const joinOrder = (count || 0) + 1;

    if (joinOrder > 6) {
      return new Response(JSON.stringify({ error: 'Room is full' }), { status: 400, headers: corsHeaders });
    }

    const { data: player, error } = await supabase.from('room_players').insert({
      room_id: room.id, user_id: user.id, display_name, join_order: joinOrder, is_ready: false
    }).select().single();
    if (error) throw error;

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    await serviceClient.channel(`room:${room.id}`).send({
      type: 'broadcast',
      event: 'player:joined',
      payload: {
        player: {
          id: player.id,
          name: display_name,
          score: 0, streak: 0,
          isReady: false, isConnected: true,
          joinOrder,
        }
      }
    });

    return new Response(JSON.stringify({
      room_id: room.id, code: room.code,
      category: room.category, rounds: room.rounds,
      timer_seconds: room.timer_seconds, difficulty: room.difficulty,
      player_id: player.id, join_order: joinOrder,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
