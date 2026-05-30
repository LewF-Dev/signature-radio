/* ═══════════════════════════════════════════════════════
   store.js — Printful product catalogue
   Fetches products from /api/store-products (Cloudflare
   Pages function that proxies the Printful API server-side).
═══════════════════════════════════════════════════════ */

window.SRUK_initStore = function initStore() {
  const grid    = document.getElementById('storeGrid');
  const loading = document.getElementById('storeLoading');
  const empty   = document.getElementById('storeEmpty');

  if (!grid) return;

  fetch('/api/store-products')
    .then(function (res) {
      if (!res.ok) throw new Error('store fetch failed');
      return res.json();
    })
    .then(function (products) {
      if (loading) loading.remove();

      if (!products || !products.length) {
        if (empty) empty.hidden = false;
        return;
      }

      products.forEach(function (product) {
        const card = document.createElement('article');
        card.className = 'store-card reveal';

        const img = document.createElement('img');
        img.src   = product.thumbnail_url || '';
        img.alt   = product.name;
        img.className = 'store-card-img';
        img.loading = 'lazy';

        const body = document.createElement('div');
        body.className = 'store-card-body';

        const name = document.createElement('h3');
        name.className = 'store-card-name';
        name.textContent = product.name;

        const price = document.createElement('p');
        price.className = 'store-card-price';
        price.textContent = product.price ? '£' + product.price : '';

        const btn = document.createElement('a');
        btn.className = 'btn-primary store-card-btn';
        btn.href      = product.url || '#';
        btn.target    = '_blank';
        btn.rel       = 'noopener';
        btn.textContent = 'BUY NOW';

        body.appendChild(name);
        body.appendChild(price);
        body.appendChild(btn);
        card.appendChild(img);
        card.appendChild(body);
        grid.appendChild(card);
      });

      // Trigger scroll reveal on newly added cards
      if (window.SRUK && window.SRUK.initScrollReveal) {
        window.SRUK.initScrollReveal();
      } else {
        // Fallback: make all cards visible immediately
        grid.querySelectorAll('.reveal').forEach(function (el) {
          el.classList.add('is-visible');
        });
      }
    })
    .catch(function () {
      if (loading) loading.remove();
      if (empty) empty.hidden = false;
    });
};

window.SRUK_initStore();
