import { ADMIN_API_ORIGIN, ADMIN_PROFILE_HEADER, ADMIN_SESSION_KEY } from '../config/adminApi.js';

export function getAdminSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) ?? 'null');
    return typeof session?.profileId === 'string' ? session : null;
  } catch {
    return null;
  }
}

export async function adminApi(path, options = {}) {
  const session = getAdminSession();
  if (!session) throw Object.assign(new Error('La sesión administrativa no está disponible.'), { code: 'DEV_PROFILE_REQUIRED', status: 403 });
  let response;
  try {
    response = await fetch(`${ADMIN_API_ORIGIN}${path}`, {
      ...options,
      headers: {
        [ADMIN_PROFILE_HEADER]: session.profileId,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw Object.assign(new Error('No se pudo conectar con la Local Admin API. Ejecuta npm run admin:api.'), { code: 'API_OFFLINE', status: 0 });
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const error = Object.assign(new Error(payload?.error?.message ?? 'La API local devolvió un error.'), {
      code: payload?.error?.code ?? 'API_ERROR',
      fields: payload?.error?.fields,
      status: response.status,
    });
    throw error;
  }
  return payload.data;
}

export function getCurrentProfile() {
  const session = getAdminSession();
  const profilesNode = document.querySelector('[data-admin-profiles]');
  try {
    return JSON.parse(profilesNode?.textContent ?? '[]').find((profile) => profile.id === session?.profileId) ?? null;
  } catch {
    return null;
  }
}
