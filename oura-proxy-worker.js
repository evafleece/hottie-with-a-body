// Hottie With A Body — Oura API CORS proxy
// Deploy this to Cloudflare Workers (free tier: 100k requests/day)
//
// Setup:
//   1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
//   2. Paste this entire file, click Deploy
//   3. Copy your worker URL (e.g. https://oura-proxy.yourname.workers.dev)
//   4. Paste it into the app's Settings → Oura section

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    const url = new URL(request.url);

    // Expect requests like: /daily_readiness?start_date=2024-01-01
    const ouraEndpoint = url.pathname.replace(/^\//, '');
    const ouraUrl = `https://api.ouraring.com/v2/usercollection/${ouraEndpoint}${url.search}`;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const ouraRes = await fetch(ouraUrl, {
      headers: { Authorization: authHeader },
    });

    const body = await ouraRes.text();

    return new Response(body, {
      status: ouraRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
