import { defineMiddleware } from 'astro:middleware';
import { canAccessAdminRoute } from './utils/roles';

// Resolve backend URL from server-only environment configuration (never exposed to browser bundles)
const BACKEND_URL = (
  import.meta.env.BACKEND_URL ||
  (typeof process !== 'undefined' ? process.env?.BACKEND_URL : undefined) ||
  ''
).replace(/\/+$/, '');

// Fail fast in production if required SSR BACKEND_URL is missing
if (import.meta.env.PROD && !BACKEND_URL) {
  throw new Error('[FATAL] BACKEND_URL is required in production for Astro SSR.');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  // Apply security headers; ensure /admin responses are never cached by browsers or proxies
  const applyHeaders = (res: Response, isAdmin: boolean = false): Response => {
    res.headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
    );
    if (isAdmin) {
      res.headers.set('Cache-Control', 'no-store, private');
      res.headers.set('Pragma', 'no-cache');
    }
    return res;
  };

  // For public routes, attach Permissions-Policy without disabling caching
  if (!url.pathname.startsWith('/admin')) {
    const res = await next();
    return applyHeaders(res, false);
  }

  // Normalize /admin or /admin/ to /admin/dashboard
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    return applyHeaders(redirect('/admin/dashboard'), true);
  }

  // Allow /admin/logout endpoint to handle server-side session revocation directly
  if (url.pathname === '/admin/logout') {
    const res = await next();
    return applyHeaders(res, true);
  }

  const isLoginPage = url.pathname === '/admin/login';
  const sessionToken = cookies.get('admin_session')?.value;

  // 1. Handling for /admin/login
  if (isLoginPage) {
    if (!sessionToken) {
      return applyHeaders(await next(), true);
    }

    // Validate if existing cookie is legitimately active
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        // Authenticated user trying to access login -> redirect to dashboard
        return applyHeaders(redirect('/admin/dashboard'), true);
      } else {
        // Invalid, expired, revoked, or mock token -> clear cookies and stay on login
        cookies.delete('admin_session', { path: '/' });
        cookies.delete('admin_user_name', { path: '/' });
        return applyHeaders(await next(), true);
      }
    } catch {
      // Backend unreachable or network failure -> clear cookies and stay on login
      cookies.delete('admin_session', { path: '/' });
      cookies.delete('admin_user_name', { path: '/' });
      return applyHeaders(await next(), true);
    }
  }

  // 2. Handling for all protected /admin/* routes
  if (!sessionToken) {
    // Missing session cookie -> redirect to login
    return applyHeaders(redirect('/admin/login'), true);
  }

  // Authoritatively validate session with backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, expired, revoked, or mock -> fail closed
      cookies.delete('admin_session', { path: '/' });
      cookies.delete('admin_user_name', { path: '/' });
      return applyHeaders(redirect('/admin/login'), true);
    }

    const userData = await response.json();

    // Store verified session identity in locals (never expose token or sensitive data)
    locals.user = {
      userId: userData.userId,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    };

    // Enforce role-based route guard: non-ADMIN users redirected to /admin/dashboard on protected routes
    if (!canAccessAdminRoute(url.pathname, userData.role, context.request.method)) {
      return applyHeaders(redirect('/admin/dashboard'), true);
    }

    return applyHeaders(await next(), true);
  } catch (error) {
    // Backend unreachable -> fail-closed, treat as unauthenticated
    cookies.delete('admin_session', { path: '/' });
    cookies.delete('admin_user_name', { path: '/' });
    return applyHeaders(redirect('/admin/login'), true);
  }
});
