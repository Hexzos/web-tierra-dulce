// DEV ONLY · NOT SECURITY · REMOVE WHEN SUPABASE AUTH IS IMPLEMENTED.
// UI visibility is not authorization. Never store passwords in this session.
const ADMIN_SESSION_KEY = 'tierra-dulce-admin-dev-session';
const DEMO_ACCESS_PHRASE = 'demo';
const page = document.querySelector('[data-admin-page]');
const profilesNode = document.querySelector('[data-admin-profiles]');
let profiles = [];

try {
  profiles = JSON.parse(profilesNode?.textContent ?? '[]').filter((profile) => profile?.isActive === true);
} catch {
  profiles = [];
}

const readSession = () => {
  try {
    const value = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) ?? 'null');
    if (!value || typeof value.profileId !== 'string' || typeof value.createdAt !== 'string') return null;
    const profile = profiles.find((candidate) => candidate.id === value.profileId);
    return profile ? { profile, createdAt: value.createdAt } : null;
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

const roleLabels = { editor: 'Editor', admin: 'Admin', developer: 'Developer' };
const publishingLabels = { review_required: 'Requiere revisión', direct_publish: 'Publicación directa' };
const currentSession = readSession();

if (page?.getAttribute('data-admin-page') === 'login') {
  if (currentSession) {
    location.replace('/admin/');
  } else {
    page.hidden = false;
    const form = page.querySelector('[data-admin-login-form]');
    const error = page.querySelector('#admin-login-error');
    const submit = page.querySelector('[data-admin-login-submit]');
    const submitLabel = page.querySelector('[data-submit-label]');
    const spinner = page.querySelector('[data-submit-spinner]');

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!(form instanceof HTMLFormElement)) return;
      const formData = new FormData(form);
      const username = String(formData.get('username') ?? '');
      const password = String(formData.get('password') ?? '');
      const profile = profiles.find((candidate) => candidate.username === username);

      if (!profile || password !== DEMO_ACCESS_PHRASE) {
        if (error instanceof HTMLElement) {
          error.textContent = 'Selecciona un perfil válido y utiliza la frase de acceso de demostración.';
          error.hidden = false;
        }
        form.querySelector(profile ? '#admin-password' : '#admin-username')?.focus();
        return;
      }

      if (error instanceof HTMLElement) error.hidden = true;
      form.setAttribute('aria-busy', 'true');
      if (submit instanceof HTMLButtonElement) submit.disabled = true;
      if (submitLabel instanceof HTMLElement) submitLabel.textContent = 'Ingresando…';
      if (spinner instanceof HTMLElement) spinner.hidden = false;
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ profileId: profile.id, createdAt: new Date().toISOString() }));
      requestAnimationFrame(() => location.replace('/admin/'));
    });
  }
}

if (page && page.getAttribute('data-admin-page') !== 'login') {
  if (!currentSession) {
    location.replace('/admin/login/');
  } else {
    const { profile } = currentSession;
    document.querySelectorAll('[data-admin-user-name]').forEach((node) => { node.textContent = profile.displayName; });
    document.querySelectorAll('[data-admin-user-role]').forEach((node) => { node.textContent = roleLabels[profile.role] ?? profile.role; });
    document.querySelectorAll('[data-admin-publishing-mode]').forEach((node) => { node.textContent = publishingLabels[profile.publishingMode] ?? profile.publishingMode; });
    document.querySelectorAll('[data-admin-user-first-name]').forEach((node) => { node.textContent = profile.displayName.split(' ')[0]; });
    document.querySelectorAll('[data-developer-admin-only]').forEach((node) => { node.hidden = profile.role === 'editor'; });
    if (profile.role === 'editor' && location.pathname.startsWith('/admin/usuarios/')) location.replace('/admin/');
    if (profile.role === 'editor' && location.pathname === '/admin/revisiones/') location.replace('/admin/');
    page.hidden = false;

    document.querySelector('[data-admin-logout]')?.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      location.replace('/admin/login/');
    });

    const menu = document.querySelector('[data-admin-menu]');
    const nav = document.querySelector('[data-admin-nav]');
    const desktop = matchMedia('(min-width: 64rem)');
    const syncNavigation = () => {
      if (!(menu instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) return;
      const isDesktop = desktop.matches;
      nav.hidden = !isDesktop;
      nav.inert = !isDesktop;
      menu.setAttribute('aria-expanded', 'false');
    };
    menu?.addEventListener('click', () => {
      if (!(menu instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) return;
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.hidden = !open;
      nav.inert = !open;
    });
    desktop.addEventListener('change', syncNavigation);
    syncNavigation();
  }
}
