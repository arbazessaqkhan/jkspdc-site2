export type AdminRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export function isAdmin(role?: string | null): boolean {
  return role === 'ADMIN';
}

export function isEditorOrAdmin(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'EDITOR';
}

export function isViewer(role?: string | null): boolean {
  return role === 'VIEWER';
}

/**
 * Routine content mutations (Gallery, Downloads/Resources, Official Contacts POST/PUT, Sub-Offices POST/PUT, Executives POST/PUT):
 * Authorized for ADMIN and EDITOR.
 */
export function canMutateRoutineContent(role?: string | null): boolean {
  return isEditorOrAdmin(role);
}

/**
 * File upload (POST /api/upload):
 * Authorized for ADMIN and EDITOR.
 */
export function canUploadFile(role?: string | null): boolean {
  return isEditorOrAdmin(role);
}

/**
 * Governance and administrative mutations (Users, Site Settings, Tenders, Projects, IPP Projects, AGM, Policies, Dignitaries, Directors, Notifications, Deletions):
 * Authorized ONLY for ADMIN.
 */
export function canMutateAdminOnly(role?: string | null): boolean {
  return isAdmin(role);
}

/**
 * File deletion (DELETE /api/upload/:filename):
 * Authorized ONLY for ADMIN.
 */
export function canDeleteFile(role?: string | null): boolean {
  return isAdmin(role);
}

/**
 * Contact and official contact deletion:
 * Authorized ONLY for ADMIN.
 */
export function canDeleteContact(role?: string | null): boolean {
  return isAdmin(role);
}

// ADMIN-only management surfaces & mutation form routes
export const ADMIN_ONLY_ROUTES: readonly string[] = [
  '/admin/users',
  '/admin/users-form',
  '/admin/site-settings',
  '/admin/audit-logs',
  '/admin/tenders-form',
  '/admin/operational-projects-form',
  '/admin/under-construction-form',
  '/admin/upcoming-projects-form',
  '/admin/policies-form',
  '/admin/dignitaries',
  '/admin/board-of-directors',
  '/admin/notifications',
  '/admin/agm',
] as const;

/**
 * Validates whether a user role is permitted to access a given admin route.
 * @param pathname URL pathname (e.g. /admin/users)
 * @param role User role from authoritative session
 * @param method HTTP method (GET, POST, etc.)
 */
export function canAccessAdminRoute(
  pathname: string,
  role?: string | null,
  method: string = 'GET'
): boolean {
  if (isAdmin(role)) {
    return true;
  }

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  // IPP projects mutation interface: block non-ADMIN from POST/mutation actions
  if (normalizedPath === '/admin/ipp-projects' && method !== 'GET') {
    return false;
  }

  // Check if route matches any ADMIN-only management or form route
  const isAdminOnly = ADMIN_ONLY_ROUTES.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + '/')
  );

  if (isAdminOnly) {
    return false;
  }

  // Routine-content and read-only listing routes remain accessible
  return true;
}
