/**
 * Vercel Serverless Function — Stripe Checkout Session
 * Env: STRIPE_SECRET_KEY (Dashboard → Developers → API keys)
 *
 * Netlify: move to netlify/functions/create-checkout-session.js and use Netlify handler shape.
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not set' });
  }

  var body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  var priceId = body && body.priceId;
  var success_url = body && body.success_url;
  var cancel_url = body && body.cancel_url;

  if (!priceId || String(priceId).indexOf('price_') !== 0) {
    return res.status(400).json({ error: 'Missing or invalid priceId' });
  }

  var origin = '';
  var referer = req.headers.referer || req.headers.origin || '';
  try {
    origin = new URL(referer).origin;
  } catch (e) {
    origin = '';
  }

  var defaultSuccess = origin ? origin + '/checkout-success.html?session_id={CHECKOUT_SESSION_ID}' : '';
  var defaultCancel = referer || origin || '/';

  try {
    var session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || defaultSuccess,
      cancel_url: cancel_url || defaultCancel,
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Stripe error' });
  }
};
