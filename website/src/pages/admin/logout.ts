import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionToken = cookies.get('admin_session')?.value;
  const BACKEND_URL = (
    import.meta.env.BACKEND_URL ||
    (typeof process !== 'undefined' ? process.env?.BACKEND_URL : undefined) ||
    ''
  ).replace(/\/+$/, '');

  if (sessionToken && BACKEND_URL) {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
    } catch {
      // Continue to clear cookies even if backend is temporarily unreachable
    }
  }

  // Clear admin_session and helper cookies using expired Set-Cookie headers
  cookies.delete('admin_session', { path: '/' });
  cookies.delete('admin_user_name', { path: '/' });

  const res = redirect('/admin/login', 303);
  res.headers.set('Cache-Control', 'no-store, private');
  res.headers.set('Pragma', 'no-cache');
  return res;
};

export const ALL: APIRoute = async () => {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
};
