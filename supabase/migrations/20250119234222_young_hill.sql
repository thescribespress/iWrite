/*
  # Add subscription and autosave features

  1. Changes to user_profiles
    - Add subscription_tier column
    - Add subscription_status column
    - Add writing_schedule column
    - Add last_reminder_sent column

  2. Changes to chapters
    - Add formatted_content column for rich text
    - Add last_autosave column

  3. New Tables
    - subscriptions table for plan management
*/

-- Add new columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS writing_schedule jsonb DEFAULT '{"days": [], "preferred_time": "09:00"}',
ADD COLUMN IF NOT EXISTS last_reminder_sent timestamptz;

-- Add new columns to chapters
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS formatted_content jsonb,
ADD COLUMN IF NOT EXISTS last_autosave timestamptz;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name IN ('Free', 'Pro', 'Enterprise')),
  price numeric NOT NULL,
  features text[] NOT NULL,
  limits jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Anyone can view subscription plans"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default subscription plans
INSERT INTO subscriptions (name, price, features, limits) VALUES
  ('Free', 0, ARRAY[
    'Up to 3 books',
    'Basic AI writing assistance',
    '1GB cloud storage',
    'Basic formatting options',
    'Export to Word'
  ], '{"books": 3, "ai_suggestions": 100, "cloud_storage": 1}'::jsonb),
  ('Pro', 9.99, ARRAY[
    'Unlimited books',
    'Advanced AI writing assistance',
    '10GB cloud storage',
    'Advanced formatting options',
    'Export to multiple formats',
    'Priority support',
    'Writing analytics',
    'Custom writing goals'
  ], '{"books": -1, "ai_suggestions": -1, "cloud_storage": 10}'::jsonb),
  ('Enterprise', 29.99, ARRAY[
    'Everything in Pro',
    'Unlimited cloud storage',
    'Custom AI training',
    'Team collaboration',
    'Publishing assistance',
    'Marketing tools',
    'Dedicated support',
    'Early access to features'
  ], '{"books": -1, "ai_suggestions": -1, "cloud_storage": -1}'::jsonb)
ON CONFLICT (id) DO NOTHING;