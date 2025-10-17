import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from '@electric-sql/client';
import { getCurrentUser } from './auth.js';

export const electricProxy = (app) =>
  app.get('/shapes/:table', async ({ params, request, jwt }) => {
    try {
      const { table } = params;
      // Use getCurrentUser from auth.js
      const user = await getCurrentUser(request, jwt);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Build upstream Electric shape URL
      const originUrl = new URL('http://electric:3000/v1/shape');
      // const originUrl = new URL('http://localhost:3000/v1/shape');
      // Only pass through Electric protocol params
      const reqUrl = new URL(request.url);
      reqUrl.searchParams.forEach((value, key) => {
        if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
          originUrl.searchParams.set(key, value);
        }
      });
      originUrl.searchParams.set('table', table);

      // Optionally scope data
      if (!user.roles || !user.roles.includes('admin')) {
        // You may want to adjust this to match your user/org model
        if (user.org_id) {
          originUrl.searchParams.set('where', `org_id = '${user.org_id}'`);
        }
      }

      // Proxy request to Electric
      let response;
      try {
        response = await fetch(originUrl);
      } catch (err) {
        console.error('Error fetching from Electric:', err);
        return new Response(JSON.stringify({ error: 'Upstream fetch failed', details: err.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const headers = new Headers(response.headers);
      headers.delete('content-encoding');
      headers.delete('content-length');
      // Remove all CORS-related headers from upstream
      headers.delete('access-control-allow-origin');
      headers.delete('access-control-allow-methods');
      headers.delete('access-control-allow-headers');
      headers.delete('access-control-allow-credentials');
      headers.delete('access-control-expose-headers');
      headers.delete('access-control-max-age');

      // If Electric returns error status, return body as JSON
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (err) {
          errorText = 'Failed to read error body';
        }
        console.error('Electric returned error:', response.status, errorText);
        return new Response(JSON.stringify({ error: 'Electric error', status: response.status, details: errorText }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      console.error('Proxy error:', err);
      return new Response(JSON.stringify({ error: 'Proxy error', details: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  });
