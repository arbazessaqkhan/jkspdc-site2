import type { APIRoute } from 'astro';
import { BACKEND_URL } from '../../../utils/api-error';
import { isAdmin } from '../../../utils/roles';

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v.data)) return v.data as T[];
    if (Array.isArray(v.value)) return v.value as T[];
  }
  return [];
}

async function fetchJson<T>(url: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ cookies, locals }) => {
  const token = cookies.get('admin_session')?.value;
  const userRole = (locals.user?.role || '').toUpperCase();

  if (!token || !isAdmin(userRole)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const start = performance.now();
  const [summary, tendersRes, contactsRes, logsRes] = await Promise.all([
    fetchJson<Record<string, unknown>>(`${BACKEND_URL}/api/dashboard-summary`, token),
    fetchJson<unknown>(`${BACKEND_URL}/api/tenders?status=Active&pageSize=25`, token),
    fetchJson<unknown>(`${BACKEND_URL}/api/contact?pageSize=15`, token),
    fetchJson<unknown>(`${BACKEND_URL}/api/audit-logs?pageSize=20`, token),
  ]);
  const apiLatencyMs = Math.max(1, Math.round(performance.now() - start));

  const activeTenders = asArray<{ id: string; referenceNo?: string; title?: string; closingDate?: string | null }>(tendersRes)
    .filter((t) => !t.closingDate || new Date(t.closingDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.closingDate || '2999-12-31').getTime() - new Date(b.closingDate || '2999-12-31').getTime())
    .slice(0, 6);

  const pendingApplications = asArray<{ id: string; name?: string; email?: string; createdAt?: string }>(contactsRes).slice(0, 6);

  const recentActivity = asArray<{ action?: string; details?: string | null; createdAt?: string }>(logsRes)
    .slice(0, 10)
    .map((l) => ({
      action: l.action || 'EVENT',
      details: l.details || null,
      createdAt: l.createdAt || '',
    }));

  return new Response(
    JSON.stringify({
      ok: Boolean(summary),
      apiLatencyMs,
      syncedAt: new Date().toISOString(),
      summary,
      activeTenders,
      pendingApplications,
      recentActivity,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    }
  );
};
