import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Up to 3 books',
      'Basic AI writing assistance',
      '1GB cloud storage',
      'Basic formatting options',
      'Export to Word'
    ],
    limits: {
      books: 3,
      ai_suggestions: 100,
      cloud_storage: 1
    }
  },
  {
    name: 'Pro',
    price: 9.99,
    features: [
      'Unlimited books',
      'Advanced AI writing assistance',
      '10GB cloud storage',
      'Advanced formatting options',
      'Export to multiple formats',
      'Priority support',
      'Writing analytics',
      'Custom writing goals'
    ],
    limits: {
      books: -1,
      ai_suggestions: -1,
      cloud_storage: 10
    }
  },
  {
    name: 'Enterprise',
    price: 29.99,
    features: [
      'Everything in Pro',
      'Unlimited cloud storage',
      'Custom AI training',
      'Team collaboration',
      'Publishing assistance',
      'Marketing tools',
      'Dedicated support',
      'Early access to features'
    ],
    limits: {
      books: -1,
      ai_suggestions: -1,
      cloud_storage: -1
    }
  }
];

export function SubscriptionPlans() {
  const handleSubscribe = async (plan: string, price: number) => {
    try {
      // Create a checkout session
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`
        },
        body: JSON.stringify({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `iWrite ${plan} Plan`,
                description: `Subscribe to iWrite ${plan} Plan`
              },
              unit_amount: Math.round(price * 100), // Convert to cents
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }],
          mode: 'subscription',
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cancel`
        })
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to process subscription. Please try again.');
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your writing journey
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg overflow-hidden bg-white transform transition-all hover:scale-105 ${
                plan.name === 'Pro' ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                  className={`w-full rounded-md px-4 py-2 text-sm font-semibold shadow-sm ${
                    plan.name === 'Pro'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}