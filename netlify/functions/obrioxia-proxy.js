export default async (req, context) => {
  // Get the backend URL and API key from Netlify's environment variables
  const backend = process.env.OBRIOXIA_BACKEND_URL;
  const key = process.env.OBRIOXIA_API_KEY;

  // Get the path from the request (e.g., /api/log -> /log)
  const path = new URL(req.url).pathname.replace('/.netlify/functions/obrioxia-proxy', '');

  // Construct the full URL to the Render backend
  const url = backend + path;

  // Build the request, copying the method and body
  const init = {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers), // Copy existing headers
      'X-Obrioxia-Key': key,              // Add the secret API key
      'host': new URL(backend).host       // Set the host header to the backend's host
    },
    // Only add a body if it's not a GET or HEAD request
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.text()
  };

  // Make the actual request to the Render backend
  const resp = await fetch(url, init);

  // Return the backend's response (body, status, headers) back to the Angular app
  return new Response(resp.body, { 
    status: resp.status, 
    headers: resp.headers 
  });
};

