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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${event.headers.origin}/checkout.html?success=true`,
      cancel_url: `${event.headers.origin}/configure.html`,
      metadata: {
        size: size === 'luxe-grand' ? 'Luxe Grand Edition (96×50cm)' : 'Luxe Edition (50×50cm)',
        wood: wood === 'ebony' ? 'Obsidian Oak' : 'Nordic Oak',
        interior: interior === 'crimson' ? 'Crimson Atelier' : interior === 'slate' ? 'Slate Studio' : 'Jungle Sanctuary',
        atmosphere: atmosphere,
      },
      custom_text: {
        submit: {
          message: `Your table will be handcrafted to order in Perth. Lead time 2–3 weeks.`,
        },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
