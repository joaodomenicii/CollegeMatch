/*
  # Add Geolocation Support to Profiles

  ## Changes
  
  ### profiles table modifications
  - Added latitude column for geographic latitude
  - Added longitude column for geographic longitude
  - Added last_location_update for tracking when location was last set
  - All columns have defaults to maintain backward compatibility

  ## Features
  - Users can share their location with the app
  - Distance-based matching to show nearby users first
  - Location privacy is optional
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN latitude NUMERIC(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN longitude NUMERIC(11, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_location_update'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_location_update timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
