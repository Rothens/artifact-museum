const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '';

export function corsHeaders() {
  if (!CORS_ORIGIN) return {};
  return {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function handlePreflight() {
  if (!CORS_ORIGIN) return null;
  return new Response(null, { status: 204, headers: corsHeaders() });
}
