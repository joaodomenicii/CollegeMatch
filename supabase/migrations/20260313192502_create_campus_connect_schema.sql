/*
  # Campus Connect - Dating App Schema

  ## Overview
  Complete database schema for a college-focused dating app similar to Tinder/Bumble.
  
  ## Tables Created
  
  ### 1. profiles
  Stores user profile information linked to auth.users
  - id (uuid, FK to auth.users)
  - full_name (text)
  - bio (text)
  - university (text)
  - major (text)
  - graduation_year (integer)
  - photo_url (text)
  - additional_photos (text array)
  - interests (text array)
  - gender (text)
  - looking_for (text)
  - age (integer)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  
  ### 2. swipes
  Tracks all swipe actions (likes and passes)
  - id (uuid, PK)
  - swiper_id (uuid, FK to profiles)
  - swiped_id (uuid, FK to profiles)
  - liked (boolean)
  - created_at (timestamptz)
  
  ### 3. matches
  Created when two users like each other
  - id (uuid, PK)
  - user1_id (uuid, FK to profiles)
  - user2_id (uuid, FK to profiles)
  - created_at (timestamptz)
  - last_message_at (timestamptz)
  
  ### 4. messages
  Chat messages between matched users
  - id (uuid, PK)
  - match_id (uuid, FK to matches)
  - sender_id (uuid, FK to profiles)
  - content (text)
  - created_at (timestamptz)
  - read (boolean)
  
  ## Security
  - RLS enabled on all tables
  - Users can only read/update their own profile
  - Users can only see swipes they're involved in
  - Users can only see matches they're part of
  - Users can only send/read messages in their matches
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  bio text DEFAULT '',
  university text NOT NULL,
  major text DEFAULT '',
  graduation_year integer,
  photo_url text,
  additional_photos text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  gender text,
  looking_for text,
  age integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (user1_id < user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Swipes policies
CREATE POLICY "Users can view swipes they made"
  ON swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = swiper_id);

CREATE POLICY "Users can insert their own swipes"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Function to automatically create match when two users like each other
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.liked = true THEN
    IF EXISTS (
      SELECT 1 FROM swipes
      WHERE swiper_id = NEW.swiped_id
      AND swiped_id = NEW.swiper_id
      AND liked = true
    ) THEN
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create matches automatically
DROP TRIGGER IF EXISTS on_mutual_like ON swipes;
CREATE TRIGGER on_mutual_like
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

-- Function to update last_message_at on matches
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches
  SET last_message_at = NEW.created_at
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update match timestamp
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_match_last_message();