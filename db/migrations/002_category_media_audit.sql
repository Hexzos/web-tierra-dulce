ALTER TABLE categories ADD COLUMN image_path TEXT;
ALTER TABLE categories ADD COLUMN image_alt TEXT
  CHECK (image_path IS NULL OR (image_alt IS NOT NULL AND length(trim(image_alt)) BETWEEN 5 AND 180));
