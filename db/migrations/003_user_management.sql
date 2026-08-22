ALTER TABLE profiles ADD COLUMN email TEXT;
ALTER TABLE profiles ADD COLUMN invitation_status TEXT NOT NULL DEFAULT 'accepted'
  CHECK (invitation_status IN ('none','pending','accepted','cancelled','expired'));
ALTER TABLE profiles ADD COLUMN created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN updated_by TEXT REFERENCES profiles(id) ON DELETE SET NULL;

UPDATE profiles SET email = username || '@tierra-dulce.local' WHERE email IS NULL;
CREATE UNIQUE INDEX profiles_email_unique_idx ON profiles(lower(email));
CREATE INDEX profiles_management_idx ON profiles(role, is_active, invitation_status);
