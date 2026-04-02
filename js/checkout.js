function stripeCheckout(productKey) {
  var cfg = window.STRIPE_CHECKOUT || {};
  var mode = cfg.mode || 'payment_link';

  if (mode === 'checkout_session') {
    var priceId = (cfg.priceIds || {})[productKey];
    if (!priceId || String(priceId).indexOf('price_') !== 0) {
      window.alert('Stripe: set priceIds.' + productKey + ' in js/checkout.config.js to your Price ID (price_…).');
      return;
    }
    var api = cfg.apiEndpoint || '/api/create-checkout-session';
    var origin = window.location.origin;
    var payload = {
      priceId: priceId,
      success_url: cfg.successUrl || (origin + '/checkout-success.html?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: cfg.cancelUrl || window.location.href,
    };
    fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || r.statusText);
          return data;
        });
      })
      .then(function (data) {
        if (data.url) window.location.href = data.url;
        else throw new Error('No checkout URL returned');
      })
      .catch(function (e) {
        window.alert('Checkout could not start: ' + (e.message || String(e)));
      });
    return;
  }

  var link = (cfg.paymentLinks || {})[productKey];
  if (link && String(link).trim()) {
    window.location.href = String(link).trim();
    return;
  }
  window.alert('Stripe: paste Payment Link URLs in js/checkout.config.js (paymentLinks), or use checkout_session mode with Price IDs and deploy the API route.');
}
