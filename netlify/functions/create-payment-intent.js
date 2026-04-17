const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { size, wood, interior, atmosphere } = JSON.parse(event.body);

    const priceId = size === 'luxe-grand'
      ? 'price_1TN3zpPQyguNOX8EyXXO3AJq'
      : 'price_1TN3zTPQyguNOX8E2WJvf9on';

    // Retrieve amount from Stripe so it stays in sync with your dashboard
    const price = await stripe.prices.retrieve(priceId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
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
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        amount: price.unit_amount,
        currency: price.currency,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
