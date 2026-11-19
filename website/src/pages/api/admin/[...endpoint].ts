import type { APIRoute } from 'astro';

const BACKEND_URL = (
  import.meta.env.BACKEND_URL ||
  (typeof process !== 'undefined' ? process.env?.BACKEND_URL : undefined) ||
  'http://localhost:3000'
).replace(/\/+$/, '');

export const ALL: APIRoute = async (context) => {
  const { request, params, cookies, url } = context;

  // 1. Authoritative server-side session check
  const sessionToken = cookies.get('admin_session')?.value;
  if (!sessionToken) {
    return new Response(
      JSON.stringify({ statusCode: 401, message: 'Authentication required. No active administrative session found.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private' },
      }
    );
  }

  // 2. Validate and normalize the target backend route
  const endpoint = params.endpoint;
  if (!endpoint || endpoint.includes('..')) {
    return new Response(
      JSON.stringify({ statusCode: 400, message: 'Invalid administrative API endpoint.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Construct target backend URL including query parameters
  const targetUrl = `${BACKEND_URL}/api/${endpoint}${url.search}`;

  try {
    const headers = new Headers();
    // Inject authoritative Bearer token server-to-server
    headers.set('Authorization', `Bearer ${sessionToken}`);

    // Forward real client IP to upstream NestJS API for rate limiting & audit logs
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    if (clientIp) {
      headers.set('X-Forwarded-For', clientIp);
    }
    const incomingProto = request.headers.get('x-forwarded-proto');
    if (incomingProto) {
      headers.set('X-Forwarded-Proto', incomingProto);
    }

    // Forward relevant incoming headers (Content-Type, Accept)
    const incomingContentType = request.headers.get('content-type');
    if (incomingContentType) {
      headers.set('Content-Type', incomingContentType);
    }
    const incomingAccept = request.headers.get('accept');
    if (incomingAccept) {
      headers.set('Accept', incomingAccept);
    }

    // Determine request body
    const method = request.method.toUpperCase();
    const hasBody = method !== 'GET' && method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseContentType = backendRes.headers.get('content-type') || 'application/json';
    const responseBody = await backendRes.arrayBuffer();

    return new Response(responseBody, {
      status: backendRes.status,
      headers: {
        'Content-Type': responseContentType,
        'Cache-Control': 'no-store, private',
        'Pragma': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error(`[Admin Proxy Error] Failed to proxy request to ${targetUrl}:`, error);
    return new Response(
      JSON.stringify({
        statusCode: 502,
        message: 'Administrative gateway failed to communicate with upstream API service.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
