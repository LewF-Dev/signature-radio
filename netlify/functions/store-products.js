/* ═══════════════════════════════════════════════════════
   GET /api/store-products
   Proxies the Printful API to return the store's product
   list. Keeps the API key server-side.

   Required env var: PRINTFUL_API_KEY
   Optional env var: PRINTFUL_STORE_ID (if account has
   multiple stores)
═══════════════════════════════════════════════════════ */

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300', // cache 5 min
};

export default async function handler(req) {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Store not configured' }),
      { status: 503, headers: HEADERS }
    );
  }

  try {
    // Fetch sync products (products linked to the Printful store)
    const storeId = process.env.PRINTFUL_STORE_ID || '';
    const url = storeId
      ? `https://api.printful.com/store/products?store_id=${storeId}&limit=50`
      : 'https://api.printful.com/store/products?limit=50';

    const res = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'X-PF-Store-Id': storeId || '',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error('Printful upstream ' + res.status);

    const data = await res.json();
    const items = (data.result || []).map(function (item) {
      return {
        id:            item.id,
        name:          item.name,
        thumbnail_url: item.thumbnail_url || '',
        // Printful sync products don't include price at list level;
        // price comes from the variant. Expose a placeholder — the
        // store page can be extended to fetch individual product
        // variants for accurate pricing.
        price:         null,
        url:           'https://www.printful.com/uk', // replace with your storefront URL
      };
    });

    return new Response(JSON.stringify(items), { status: 200, headers: HEADERS });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to load products' }),
      { status: 502, headers: HEADERS }
    );
  }
}

export const config = { path: '/api/store-products' };
