/*
  # Optimize RLS Performance and Remove Duplicate/Unused Indexes

  1. RLS Policy Optimization
    - Replace auth.uid() with (select auth.uid()) in "System can create matches" policy
    - This prevents re-evaluation of auth functions for each row
    - Improves query performance at scale

  2. Remove Duplicate Indexes
    - Keep idx_matches_user1, drop idx_matches_user1_fkey
    - Keep idx_matches_user2, drop idx_matches_user2_fkey
    - Keep idx_swipes_swiper, drop idx_swipes_swiper_fkey
    - Keep idx_swipes_swiped, drop idx_swipes_swiped_fkey

  3. Remove Unused Foreign Key Indexes
    - Drop idx_messages_sender_id (application doesn't query by sender_id alone)
    - Drop idx_messages_match_fkey (application doesn't query by match_id alone)

  Note: The existing idx_swipes_swiper, idx_swipes_swiped, idx_matches_user1, and idx_matches_user2 indexes
  are kept to maintain performance for the profile query operations that filter by these user IDs.
*/

-- Optimize RLS policy: Replace auth.uid() with (select auth.uid())
DROP POLICY IF EXISTS "System can create matches" ON public.matches;
CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user1_id OR (select auth.uid()) = user2_id
  );

-- Drop duplicate _fkey indexes (keep the original ones)
DROP INDEX IF EXISTS public.idx_matches_user1_fkey;
DROP INDEX IF EXISTS public.idx_matches_user2_fkey;
DROP INDEX IF EXISTS public.idx_swipes_swiper_fkey;
DROP INDEX IF EXISTS public.idx_swipes_swiped_fkey;

-- Drop unused message indexes
DROP INDEX IF EXISTS public.idx_messages_sender_id;
DROP INDEX IF EXISTS public.idx_messages_match_fkey;
