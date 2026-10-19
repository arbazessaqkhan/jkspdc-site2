/**
 * Shared pagination helper for admin list pages.
 * Fetches `${BACKEND_URL}${endpoint}?page=&pageSize=&…filters` and returns
 * a normalized envelope. Endpoints that don't paginate yet return arrays —
 * handled gracefully as a single page.
 */
export interface PageState {
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
  lastPage: number;
  error: string | null;
}

export function readPageParams(url: URL, defaultPageSize = 10) {
  const rawPage = parseInt(url.searchParams.get('page') || '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawSize = parseInt(url.searchParams.get('pageSize') || String(defaultPageSize), 10);
  const pageSize = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, 100) : defaultPageSize;
  return { page, pageSize };
}

/** Query string preserved from the current URL, minus page (pageSize re-added). */
export function filterQuery(url: URL, extra: Record<string, string | undefined> = {}): URLSearchParams {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) {
    if (v) params.set(k, String(v));
  }
  // keep other filters already present in the URL (except page/pageSize)
  url.searchParams.forEach((v, k) => {
    if (k !== 'page' && k !== 'pageSize' && v && !params.has(k)) params.set(k, v);
  });
  return params;
}

export function pageUrl(url: URL, page: number, pageSize: number, extra: Record<string, string | undefined> = {}): string {
  const params = filterQuery(url, extra);
  params.set('pageSize', String(pageSize));
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `${url.pathname}${qs ? '?' + qs : ''}`;
}

export async function fetchPaged(
  endpoint: string,
  opts: {
    BACKEND_URL: string;
    token?: string;
    page: number;
    pageSize: number;
    extra?: Record<string, string | undefined>;
    signal?: AbortSignal;
  },
): Promise<PageState> {
  const { BACKEND_URL, token, page, pageSize, extra } = opts;
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(extra || {})) {
    if (v !== undefined && v !== null && v !== '') params[k] = String(v);
  }
  params.page = String(page);
  params.pageSize = String(pageSize);
  const qs = new URLSearchParams(params).toString();
  const state: PageState = { rows: [], total: 0, page, pageSize, lastPage: 1, error: null };
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}?${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: opts.signal,
    });
    if (res.ok) {
      const body = await res.json();
      if (Array.isArray(body)) {
        state.rows = body;
        state.total = body.length;
        state.lastPage = 1;
      } else {
        state.rows = body.data ?? [];
        state.total = body.total ?? state.rows.length;
        state.lastPage = Math.max(1, body.lastPage ?? Math.ceil(state.total / state.pageSize));
      }
      if (state.page > state.lastPage) state.rows = [];
    } else if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    } else {
      state.error = `Failed to load list (HTTP ${res.status}).`;
    }
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') throw e;
    state.error = 'Network failure: Unable to reach backend server.';
  }
  return state;
}

/** Page-nav window: at most 5 numeric pages centred on current. */
export function pageWindow(page: number, lastPage: number, span = 5): number[] {
  const out: number[] = [];
  const half = Math.floor(span / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(lastPage, start + span - 1);
  start = Math.max(1, end - span + 1);
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}
