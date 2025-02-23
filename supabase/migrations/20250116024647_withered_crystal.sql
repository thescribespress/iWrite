/*
  # Initial Schema Setup

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamp)
    - `books`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `genre` (text)
      - `target_word_count` (integer)
      - `current_word_count` (integer)
      - `status` (text)
      - `created_at` (timestamp)
    - `chapters`
      - `id` (uuid, primary key)
      - `book_id` (uuid, references books)
      - `title` (text)
      - `content` (text)
      - `word_count` (integer)
      - `order` (integer)
      - `created_at` (timestamp)
    - `writing_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `daily_word_count` (integer)
      - `writing_days` (text[])
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create tables
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  genre text,
  target_word_count integer DEFAULT 0,
  current_word_count integer DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  word_count integer DEFAULT 0,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE writing_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  daily_word_count integer DEFAULT 1000,
  writing_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  USING (auth.uid() = id);

CREATE POLICY "Users can manage their own books"
  ON books
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chapters"
  ON chapters
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own writing goals"
  ON writing_goals
  USING (auth.uid() = user_id);