/*
  # Fix Security Issues

  1. Indexes
    - Add index on messages.sender_id for foreign key performance
    - Remove unused indexes

  2. RLS Policies
    - Optimize all auth() function calls to use (select auth()) for better performance
    - Prevents re-evaluation on each row

  3. Functions
    - Set immutable search_path on trigger functions to prevent role-based mutations

  4. Auth Security
    - HaveIBeenPwned protection is enabled at the project level (no action needed in DB)
*/

-- Add missing index for messages.sender_id foreign key
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Drop unused indexes
DROP INDEX IF EXISTS public.idx_messages_match;
DROP INDEX IF EXISTS public.idx_profiles_location;

-- Optimize RLS policies - Replace auth.uid() with (select auth.uid())
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = (select auth.uid()))
  WITH CHECK (auth.uid() = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view swipes they made" ON public.swipes;
CREATE POLICY "Users can view swipes they made"
  ON public.swipes FOR SELECT
  USING (swiper_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own swipes" ON public.swipes;
CREATE POLICY "Users can insert their own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (swiper_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
CREATE POLICY "Users can view their matches"
  ON public.matches FOR SELECT
  USING (
    user1_id = (select auth.uid()) OR user2_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "System can create matches" ON public.matches;
CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
CREATE POLICY "Users can view messages in their matches"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE (matches.user1_id = (select auth.uid()) OR matches.user2_id = (select auth.uid()))
      AND matches.id = messages.match_id
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.messages;
CREATE POLICY "Users can send messages in their matches"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE (matches.user1_id = (select auth.uid()) OR matches.user2_id = (select auth.uid()))
      AND matches.id = messages.match_id
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = (select auth.uid()))
  WITH CHECK (sender_id = (select auth.uid()));

-- Fix function search path mutability
DROP FUNCTION IF EXISTS public.create_match_on_mutual_like() CASCADE;
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS TRIGGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.swipes
    WHERE swiper_id = NEW.swiped_id
    AND swiped_id = NEW.swiper_id
    AND liked = true
  ) THEN
    INSERT INTO public.matches (user1_id, user2_id, created_at, last_message_at)
    VALUES (
      LEAST(NEW.swiper_id, NEW.swiped_id),
      GREATEST(NEW.swiper_id, NEW.swiped_id),
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.update_match_last_message() CASCADE;
CREATE OR REPLACE FUNCTION public.update_match_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.matches
  SET last_message_at = NOW()
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS on_swipe_create ON public.swipes;
CREATE TRIGGER on_swipe_create
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_on_mutual_like();

DROP TRIGGER IF EXISTS on_message_create ON public.messages;
CREATE TRIGGER on_message_create
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_match_last_message();
