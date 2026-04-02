/**
 * Stripe checkout for The Haus by DOW
 *
 * Option A — Payment Links (simplest, no server): set mode to "payment_link" and paste
 * each product link from Stripe Dashboard → Product catalog → Payment links.
 * Optional: create one Payment Link that includes BOTH devotionals at a bundle price and
 * set paymentLinks.bundle — then a two-item cart can check out in one Stripe payment.
 *
 * Option B — Checkout Sessions (deploy api/create-checkout-session.js + STRIPE_SECRET_KEY):
 * set mode to "checkout_session", add Stripe Price IDs (price_…) per product, deploy to Vercel/Netlify.
 */
window.STRIPE_CHECKOUT = {
  mode: 'payment_link',

  paymentLinks: {
    mothersDay: '',
    fathersDay: '',
    bundle: '',
  },

  priceIds: {
    mothersDay: '',
    fathersDay: '',
  },

  apiEndpoint: '/api/create-checkout-session',

  successUrl: null,
  cancelUrl: null,
};
