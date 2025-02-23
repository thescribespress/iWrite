/*
  # Add social features

  1. New Tables
    - `resources`: For sharing writing tips and resources
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `tags` (text[])
      - `likes` (integer)
      - `created_at` (timestamptz)

    - `comments`: For book and resource comments
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `book_id` (uuid, references books, nullable)
      - `resource_id` (uuid, references resources, nullable)
      - `content` (text)
      - `created_at` (timestamptz)

    - `follows`: For user following relationships
      - `follower_id` (uuid, references user_profiles)
      - `following_id` (uuid, references user_profiles)
      - `created_at` (timestamptz)

  2. Table Modifications
    - Add social columns to user_profiles:
      - `bio` (text)
      - `website` (text)
      - `followers` (text[])
      - `following` (text[])
    
    - Add social columns to books:
      - `is_public` (boolean)
      - `likes` (integer)
      - `comments_count` (integer)

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books ON DELETE CASCADE,
  resource_id uuid REFERENCES resources ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT comment_target_check CHECK (
    (book_id IS NOT NULL AND resource_id IS NULL) OR
    (book_id IS NULL AND resource_id IS NOT NULL)
  )
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Add columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS followers text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS following text[] DEFAULT '{}';

-- Add columns to books
ALTER TABLE books
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0;

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources
CREATE POLICY "Users can create resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "Users can create follows"
  ON follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Anyone can view follows"
  ON follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their own follows"
  ON follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create functions for managing counters
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.book_id IS NOT NULL THEN
    UPDATE books
    SET comments_count = comments_count + 1
    WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.book_id IS NOT NULL THEN
    UPDATE books
    SET comments_count = comments_count - 1
    WHERE id = OLD.book_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for managing counters
CREATE TRIGGER increment_comments_count_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_comments_count();

CREATE TRIGGER decrement_comments_count_trigger
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_comments_count();