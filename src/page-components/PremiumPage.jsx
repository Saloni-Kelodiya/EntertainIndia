"use client"
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';

export default function PremiumPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useStore();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Check if user has premium subscription
  const hasPremium = user?.subscription?.status === 'active';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: '₹299',
      amount: 29900, // Amount in paise (299 * 100)
      period: '/month',
      duration: 30, // days
      features: [
        'Access to all premium articles',
        'Exclusive celebrity interviews',
        'Behind-the-scenes content',
        'Ad-free experience',
        'Early access to reviews',
        'Premium video content',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: '₹2,999',
      amount: 299900, // Amount in paise (2999 * 100)
      period: '/year',
      duration: 365, // days
      badge: 'Save 17%',
      features: [
        'All Monthly Premium features',
        'Exclusive virtual events access',
        'Premium newsletter',
        'Priority customer support',
        'Downloadable content',
        'Special merchandise discounts',
      ],
    },
  ];

  const handleSubscribe = async (plan) => {
    if (processing) return;
    
    setProcessing(true);
    setSelectedPlan(plan.id);

    // Demo mode - Activate premium immediately for testing
    if (window.confirm('Premium Subscription\n\n' + plan.name + ' - ' + plan.price + '\n\nActivate premium for testing?\n\n(Real payment integration coming soon!)')) {
      const subscriptionData = {
        status: 'active',
        plan: plan.id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString(),
        transactionId: 'DEMO_' + Date.now(),
        amount: plan.amount / 100,
      };
      
      const updatedUser = {
        ...user,
        subscription: subscriptionData,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProcessing(false);
      alert('Premium activated! 🎉\n\nYou now have access to all premium content!');
      router.push('/premium-content');
    } else {
      setProcessing(false);
    }
  };

  return (
    <>
      
        <title>Premium Subscription - EntertainIndia</title>
      

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-16">
        <div className="container-custom text-center">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {hasPremium ? 'Your Premium Membership' : 'Upgrade to Premium'}
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            {hasPremium 
              ? 'Enjoy exclusive content and features as a premium member'
              : 'Get unlimited access to exclusive entertainment content'}
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {hasPremium ? (
          /* Premium Member Dashboard */
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 bg-gradient-to-br from-yellow-50 to-purple-50 border-2 border-yellow-400 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-purple-900 mb-2">
                    Active Premium Member
                  </h2>
                  <p className="text-gray-700">
                    Subscription Status: <span className="font-bold text-green-600">Active</span>
                  </p>
                  <p className="text-gray-700">
                    Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-5xl">✨</div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/premium-content')}
                  className="flex-1 btn-primary"
                >
                  Browse Premium Content
                </button>
                <button
                  onClick={() => alert('Manage subscription coming soon!')}
                  className="px-6 py-3 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Premium Features */}
            <div className="card p-8">
              <h3 className="text-2xl font-heading font-bold mb-6">Your Premium Benefits</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: '📰', title: 'Premium Articles', desc: 'Access all exclusive content' },
                  { icon: '🎬', title: 'Premium Videos', desc: 'Behind-the-scenes footage' },
                  { icon: '🎤', title: 'Celebrity Interviews', desc: 'Exclusive interviews' },
                  { icon: '⭐', title: 'Early Reviews', desc: 'Get reviews before everyone' },
                  { icon: '🚫', title: 'Ad-Free', desc: 'No advertisements' },
                  { icon: '🎁', title: 'Special Perks', desc: 'Merchandise discounts' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <span className="text-3xl">{benefit.icon}</span>
                    <div>
                      <h4 className="font-bold text-purple-900">{benefit.title}</h4>
                      <p className="text-sm text-gray-700">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Subscription Plans */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4">Choose Your Plan</h2>
              <p className="text-gray-600">Select the perfect plan for your entertainment needs</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`card p-8 relative ${
                    plan.badge ? 'border-2 border-purple-500 shadow-xl' : ''
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 right-8 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      {plan.badge}
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-heading font-bold mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-purple-700">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={processing && selectedPlan === plan.id}
                    className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.badge
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 transform hover:scale-105'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {processing && selectedPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Processing...
                      </span>
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Why Premium Section */}
            <div className="card p-8 bg-gradient-to-br from-purple-50 to-blue-50">
              <h3 className="text-2xl font-heading font-bold text-center mb-8">
                Why Go Premium?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎯</div>
                  <h4 className="font-bold mb-2">Exclusive Content</h4>
                  <p className="text-sm text-gray-600">
                    Get access to premium articles, interviews, and behind-the-scenes content
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-3"></div>
                  <h4 className="font-bold mb-2">Early Access</h4>
                  <p className="text-sm text-gray-600">
                    Be the first to read reviews and watch exclusive videos
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-3">💎</div>
                  <h4 className="font-bold mb-2">Ad-Free Experience</h4>
                  <p className="text-sm text-gray-600">
                    Enjoy uninterrupted browsing without any advertisements
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
