-- WordBlitz Database Schema

CREATE TABLE rooms (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  host_id     uuid NOT NULL,
  category    text NOT NULL,
  rounds      int  DEFAULT 8,
  timer_seconds int DEFAULT 15,
  difficulty  text DEFAULT 'mixed',
  status      text DEFAULT 'waiting',  -- waiting | playing | finished
  current_index int DEFAULT 0,
  word_queue  jsonb DEFAULT '[]'::jsonb,
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz DEFAULT now() + interval '2 hours'
);

CREATE TABLE room_players (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id      uuid REFERENCES rooms(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL,
  display_name text NOT NULL,
  score        int DEFAULT 0,
  join_order   int NOT NULL,
  is_ready     boolean DEFAULT false,
  answered_at  timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE game_events (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id        uuid REFERENCES rooms(id) ON DELETE CASCADE,
  player_id      uuid,
  event_type     text NOT NULL,  -- round_won | timeout | game_start | game_end
  word_index     int,
  answer_correct boolean DEFAULT false,
  response_ms    int,
  payload        jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events   ENABLE ROW LEVEL SECURITY;

-- Rooms: anyone can read; only authenticated users can create
CREATE POLICY "rooms_read"   ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (auth.uid() = host_id);

-- Room players: anyone can read; authenticated users can insert/update their own
CREATE POLICY "rp_read"   ON room_players FOR SELECT USING (true);
CREATE POLICY "rp_insert" ON room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rp_update" ON room_players FOR UPDATE USING (auth.uid() = user_id);

-- Game events: readable by all; insertable only via service role (Edge Functions)
CREATE POLICY "ge_read" ON game_events FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_rooms_code        ON rooms(code);
CREATE INDEX idx_rooms_status      ON rooms(status);
CREATE INDEX idx_rp_room           ON room_players(room_id);
CREATE INDEX idx_ge_room           ON game_events(room_id, word_index);
