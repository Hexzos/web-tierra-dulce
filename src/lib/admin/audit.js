export function writeAudit(db, { userId, action, entityType, entityId, metadata = null, ip = null }) {
  db.prepare('INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata, created_at, ip) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(userId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null, new Date().toISOString(), ip);
}

export function diffFields(before, after, fields) {
  return Object.fromEntries(fields.filter((field) => before?.[field] !== after?.[field]).map((field) => [field, { from: before?.[field] ?? null, to: after?.[field] ?? null }]));
}
