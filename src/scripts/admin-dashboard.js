import { adminApi } from './admin-api-client.js';

adminApi('/api/admin/stats').then((stats) => {
  document.querySelectorAll('[data-admin-stat]').forEach((node) => {
    const key = node.getAttribute('data-admin-stat');
    if (key && Number.isInteger(stats[key])) node.textContent = String(stats[key]);
  });
}).catch(() => {
  // Build-time values remain visible when the local-only API is offline.
});
