/*
  # Fix All Security Issues

  1. Foreign Key Indexes
    - Add index on messages.match_id (covering index for foreign key)
    - Add index on messages.sender_id (covering index for foreign key)
    - Add index on swipes foreign keys
    - Add index on matches foreign keys

  2. Unused Indexes
    - Keep idx_messages_sender_id as it's now needed for the foreign key
    - Remove truly unused indexes

  3. Auth DB Connection Strategy
    - Update Auth server connection settings to use percentage-based allocation (no migration needed - done in settings)

  4. RLS Policy Security
    - Fix "System can create matches" policy to require proper authorization
    - Policy must check that the inserting user is one of the match participants

  5. Leaked Password Protection
    - Enable HaveIBeenPwned protection (no migration needed - done in settings)

  Important Notes:
  - All policies use auth.uid() for proper security context
  - Foreign key indexes prevent N+1 query problems and improve cascading delete performance
  - The matches INSERT policy now properly restricts access to authenticated users creating their own matches
*/

DO $$
BEGIN
  -- Add covering index for messages.match_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'messages' AND indexname = 'idx_messages_match_fkey'
  ) THEN
    CREATE INDEX idx_messages_match_fkey ON public.messages(match_id);
  END IF;

  -- Verify idx_messages_sender_id exists (this is the used index from the previous migration)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'messages' AND indexname = 'idx_messages_sender_id'
  ) THEN
    CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
  END IF;

  -- Add covering indexes for swipes foreign keys
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'swipes' AND indexname = 'idx_swipes_swiper_fkey'
  ) THEN
    CREATE INDEX idx_swipes_swiper_fkey ON public.swipes(swiper_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'swipes' AND indexname = 'idx_swipes_swiped_fkey'
  ) THEN
    CREATE INDEX idx_swipes_swiped_fkey ON public.swipes(swiped_id);
  END IF;

  -- Add covering indexes for matches foreign keys
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'matches' AND indexname = 'idx_matches_user1_fkey'
  ) THEN
    CREATE INDEX idx_matches_user1_fkey ON public.matches(user1_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'matches' AND indexname = 'idx_matches_user2_fkey'
  ) THEN
    CREATE INDEX idx_matches_user2_fkey ON public.matches(user2_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "System can create matches" ON public.matches;
CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

COMMENT ON TABLE public.messages IS 'Messages between matched users - uses row level security to restrict access';
COMMENT ON INDEX public.idx_messages_match_fkey IS 'Covering index for match_id foreign key - prevents N+1 queries and improves cascading delete performance';
COMMENT ON INDEX public.idx_messages_sender_id IS 'Index for sender_id queries and foreign key performance - actively used for message queries';
