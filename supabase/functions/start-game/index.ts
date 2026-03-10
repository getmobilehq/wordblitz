import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { room_id, word_queue } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify room exists and caller is host
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { data: room } = await supabase.from('rooms').select('*').eq('id', room_id).single();
    if (!room) return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    if (room.host_id !== user.id) return new Response(JSON.stringify({ error: 'Not host' }), { status: 403 });

    // Update room with word queue and set status to playing
    await supabase.from('rooms').update({
      status: 'playing',
      word_queue,
      current_index: 0,
    }).eq('id', room_id);

    // Record game start event
    await supabase.from('game_events').insert({
      room_id, event_type: 'game_start',
      payload: { category: room.category, rounds: room.rounds }
    });

    // Broadcast game start to all players in the room
    await supabase.channel(`room:${room_id}`).send({
      type: 'broadcast',
      event: 'game:start',
      payload: {
        word_queue,
        config: {
          category: room.category,
          rounds: room.rounds,
          timerSeconds: room.timer_seconds,
          difficulty: room.difficulty,
        }
      }
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
