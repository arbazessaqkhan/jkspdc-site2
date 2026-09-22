import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const filePath = params.file;
  if (!filePath) {
    return new Response('File not found', { status: 404 });
  }

  try {
    const backendRes = await fetch(`http://localhost:3000/uploads/${filePath}`);
    if (!backendRes.ok) {
      return new Response('Not found', { status: backendRes.status });
    }

    const contentType = backendRes.headers.get('content-type') || 'application/octet-stream';
    const data = await backendRes.arrayBuffer();

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Error proxying uploads:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};
