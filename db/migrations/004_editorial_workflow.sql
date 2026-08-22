CREATE UNIQUE INDEX product_revisions_one_pending_idx
ON product_revisions(product_id) WHERE status = 'pending';
CREATE INDEX product_revisions_queue_idx ON product_revisions(status, created_at);
