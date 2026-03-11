import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { room_id, player_id, answer, timestamp_ms } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: room } = await supabase.from('rooms').select('*').eq('id', room_id).single();
    if (!room || room.status !== 'playing') {
      return new Response(JSON.stringify({ error: 'Invalid room' }), { status: 400, headers: corsHeaders });
    }

    const { data: existingWin } = await supabase.from('game_events')
      .select('id').eq('room_id', room_id).eq('word_index', room.current_index).eq('answer_correct', true).maybeSingle();
    if (existingWin) return new Response(JSON.stringify({ already_won: true }), { status: 409, headers: corsHeaders });

    const correctWord = room.word_queue[room.current_index];
    const normalised = answer.toUpperCase().replace(/[^A-Z]/g, '');
    const isCorrect = normalised.includes(correctWord.toUpperCase());
    if (!isCorrect) return new Response(JSON.stringify({ correct: false }), { status: 200, headers: corsHeaders });

    await supabase.from('game_events').insert({
      room_id, player_id, event_type: 'round_won', word_index: room.current_index,
      answer_correct: true, response_ms: timestamp_ms
    });

    const { data: player } = await supabase.from('room_players').select('score, display_name, user_id').eq('id', player_id).single();
    await supabase.from('room_players').update({ score: (player?.score || 0) + 1 }).eq('id', player_id);

    await supabase.channel(`room:${room_id}`).send({
      type: 'broadcast', event: 'round:won',
      payload: {
        winner_id: player?.user_id || player_id, winner_name: player?.display_name,
        correct_word: correctWord, new_score: (player?.score || 0) + 1,
        next_index: room.current_index + 1,
        game_over: room.current_index + 1 >= room.rounds
      }
    });

    if (room.current_index + 1 >= room.rounds) {
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', room_id);
    } else {
      await supabase.from('rooms').update({ current_index: room.current_index + 1 }).eq('id', room_id);
    }

    return new Response(JSON.stringify({ correct: true, winner: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
