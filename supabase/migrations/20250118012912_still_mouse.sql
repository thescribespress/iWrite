/*
  # Add subtitle to books table

  1. Changes
    - Add subtitle column to books table
    - Make it nullable to maintain compatibility with existing records
*/

ALTER TABLE books ADD COLUMN IF NOT EXISTS subtitle text;