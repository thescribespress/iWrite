/*
  # Fix user profiles policies

  1. Changes
    - Add INSERT policy for user_profiles table
    - Add SELECT policy for user_profiles table
    - Modify existing RLS policy to be more specific

  2. Security
    - Ensures users can create their own profile
    - Maintains row-level security
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- Create specific policies for each operation
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);