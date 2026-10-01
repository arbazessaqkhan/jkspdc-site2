/**
 * Authoritative server-side backend origin resolved from environment configuration.
 * Avoids any hardcoded localhost/127.0.0.1 runtime dependencies.
 */
export const BACKEND_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.BACKEND_URL) ||
  (typeof process !== 'undefined' ? process.env?.BACKEND_URL : undefined) ||
  ''
).replace(/\/+$/, '');

export interface ParsedApiError {
  status: number;
  message: string;
  isUnauthorized: boolean; // 401
  isForbidden: boolean;    // 403
  isNotFound: boolean;     // 404
  isServerError: boolean;  // 500+
}

/**
 * Extracts and formats an informative, role-aware error message from a backend API Response.
 * Distinguishes 401 (Session Expired), 403 (Insufficient Permissions), 404 (Not Found),
 * and 500+ (Server Failure) from generic network/database failures.
 *
 * For HTTP 500+, internal details (Prisma/database/stack) are safely withheld from the
 * user-facing UI and logged server-side only.
 */
export async function parseApiError(
  res: Response,
  actionDescription: string = 'complete this request'
): Promise<ParsedApiError> {
  const status = res.status;
  let backendMessage = '';

  try {
    const data = await res.clone().json();
    if (data && typeof data === 'object') {
      if (Array.isArray(data.message)) {
        backendMessage = data.message.join(', ');
      } else if (typeof data.message === 'string') {
        backendMessage = data.message;
      } else if (typeof data.error === 'string') {
        backendMessage = data.error;
      }
    }
  } catch {
    // Non-JSON response
  }

  if (status === 401) {
    return {
      status,
      message: 'Your session has expired or is invalid. Please log in again.',
      isUnauthorized: true,
      isForbidden: false,
      isNotFound: false,
      isServerError: false,
    };
  }

  if (status === 403) {
    return {
      status,
      message: backendMessage || `Access Denied: You do not have permission to ${actionDescription}.`,
      isUnauthorized: false,
      isForbidden: true,
      isNotFound: false,
      isServerError: false,
    };
  }

  if (status === 404) {
    return {
      status,
      message: backendMessage || 'The requested record or resource was not found.',
      isUnauthorized: false,
      isForbidden: false,
      isNotFound: true,
      isServerError: false,
    };
  }

  if (status >= 500) {
    if (backendMessage) {
      console.error(`[API 500 Error] Failure during ${actionDescription}:`, backendMessage);
    }
    return {
      status,
      message: `A server error occurred while trying to ${actionDescription}. Please try again later.`,
      isUnauthorized: false,
      isForbidden: false,
      isNotFound: false,
      isServerError: true,
    };
  }

  return {
    status,
    message: backendMessage || `Failed to ${actionDescription} (HTTP ${status}).`,
    isUnauthorized: false,
    isForbidden: false,
    isNotFound: false,
    isServerError: false,
  };
}

/**
 * Formats client-side friendly error messages given a status and optional backend JSON message.
 */
export function formatClientApiError(
  status: number,
  backendMessage?: string,
  actionDescription: string = 'perform this action'
): string {
  if (status === 401) {
    return 'Your session has expired or is invalid. Please log in again.';
  }
  if (status === 403) {
    return backendMessage || `Access Denied: You do not have permission to ${actionDescription}.`;
  }
  if (status === 404) {
    return backendMessage || 'The requested record or resource was not found.';
  }
  if (status >= 500) {
    return `A server error occurred while trying to ${actionDescription}. Please try again later.`;
  }
  return backendMessage || `Failed to ${actionDescription} (HTTP ${status}).`;
}
