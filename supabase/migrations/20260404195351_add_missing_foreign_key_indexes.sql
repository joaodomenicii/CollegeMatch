/*
  # Add Missing Foreign Key Indexes

  1. Add Indexes for Foreign Keys
    - Create index on messages.match_id for messages_match_id_fkey
    - Create index on messages.sender_id for messages_sender_id_fkey
    - These indexes improve query performance when filtering by these columns
*/

CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
