const ALLOWED_ORIGINS = ['https://signatureradio.uk', 'https://www.signatureradio.uk'];

function getCorsHeaders(request) {
  const origin = (request && request.headers.get('Origin')) || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Vary': 'Origin',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300',
  };
}

export async function onRequest({ request, env }) {
  const headers = getCorsHeaders(request);
  const apiKey  = env.PRINTFUL_API_KEY;
  const storeId = env.PRINTFUL_STORE_ID || '';

  if (!apiKey) {
    return new Response(JSON.stringify([]), { status: 200, headers });
  }

  try {
    const url = storeId
      ? `https://api.printful.com/store/products?store_id=${storeId}&limit=50`
      : 'https://api.printful.com/store/products?limit=50';

    const res = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        ...(storeId ? { 'X-PF-Store-Id': storeId } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error('Printful upstream ' + res.status);

    const data  = await res.json();
    const items = (data.result || []).map(function (item) {
      return {
        id:            item.id,
        name:          item.name,
        thumbnail_url: item.thumbnail_url || '',
        price:         null, // variant-level pricing requires a separate fetch per product
        url:           item.external_url || '',
      };
    });

    return new Response(JSON.stringify(items), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify([]), { status: 200, headers });
  }
}
