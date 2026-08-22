-- Development-only identities. These are not customer accounts and have no passwords.
INSERT INTO profiles (id, username, display_name, role, publishing_mode, is_active, created_at, updated_at) VALUES
  ('a38d24e1-3bc4-4fa7-a195-89296bb83d17', 'editor_demo', 'Editora Demo', 'editor', 'review_required', 1, '2026-08-21T00:00:00.000Z', '2026-08-21T00:00:00.000Z'),
  ('bbfd18ea-a47f-43ae-82d1-c731459e1884', 'admin_demo', 'Admin Demo', 'admin', 'direct_publish', 1, '2026-08-21T00:00:00.000Z', '2026-08-21T00:00:00.000Z'),
  ('d45f457d-a6e5-472a-b258-c781aaca624a', 'developer_demo', 'Developer Demo', 'developer', 'direct_publish', 1, '2026-08-21T00:00:00.000Z', '2026-08-21T00:00:00.000Z');
