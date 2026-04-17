const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { size, wood, interior, atmosphere } = JSON.parse(event.body);

    const amount = size === 'luxe-grand' ? 112000 : 74995; // cents AUD

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'aud',
      metadata: {
        size: size === 'luxe-grand' ? 'Luxe Grand Edition (96×50cm)' : 'Luxe Edition (50×50cm)',
        wood: wood === 'ebony' ? 'Smoked Ebony Oak' : 'Light Dune Oak',
        interior: interior === 'red' ? 'Imperium Red Brick' : 'Charcoal Grey Brick',
        atmosphere: atmosphere || '',
      },
      description: `Continuum Designs — ${size === 'luxe-grand' ? 'Luxe Grand' : 'Luxe'} · ${wood} / ${interior}`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        amount,
      }),
    };
  } catch (error) {
    console.error('create-payment-intent error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
