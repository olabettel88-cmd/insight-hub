'use client';

import React from "react"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Check,
  X,
  Zap,
  TrendingUp,
  Crown,
  Infinity,
  Clock,
  Wallet,
  Bitcoin,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  duration: string;
  searches: number | 'unlimited';
  features: string[];
  highlighted: boolean;
  icon: React.ReactNode;
  buttonText: string;
  codeName: string;
}

interface CryptoCurrency {
  currency: string;
  network: string;
  name: string;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    codeName: 'BASIC_ID',
    price: 20,
    period: '/ MO',
    duration: 'Billed monthly',
    searches: 100,
    features: [
      '100 searches/day',
      'Basic API Auth',
      'Support: Email',
    ],
    highlighted: false,
    icon: <Zap className="w-6 h-6" />,
    buttonText: 'SELECT_TIER',
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    codeName: 'TACTICAL_ID',
    price: 50,
    period: '/ 3MO',
    duration: 'Billed every 3 months',
    searches: 300,
    features: [
      '300 searches/day',
      'Priority Nodes',
      'Priority Support',
    ],
    highlighted: false,
    icon: <TrendingUp className="w-6 h-6" />,
    buttonText: 'SELECT_TIER',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    codeName: 'ELITE_ID',
    price: 100,
    period: '/ 3MO',
    duration: 'Billed every 3 months',
    searches: 500,
    features: [
      '500 searches/day',
      'Custom Indexing',
      '24/7_Support',
    ],
    highlighted: true,
    icon: <Crown className="w-6 h-6" />,
    buttonText: 'INITIALIZE_ELITE',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    codeName: 'TERMINAL_ID',
    price: 300,
    period: 'TOTAL',
    duration: 'One-time payment',
    searches: 'unlimited',
    features: [
      'Unlimited Searches',
      'Dedicated Nodes',
      'Infinite_Tokens',
    ],
    highlighted: false,
    icon: <Infinity className="w-6 h-6" />,
    buttonText: 'CLAIM_LIFETIME',
  },
];

const DEFAULT_CRYPTOS: CryptoCurrency[] = [
  { currency: 'BTC', network: 'BTC', name: 'Bitcoin' },
  { currency: 'ETH', network: 'ETH', name: 'Ethereum' },
  { currency: 'USDT', network: 'TRC20', name: 'Tether (TRC20)' },
  { currency: 'USDT', network: 'ERC20', name: 'Tether (ERC20)' },
  { currency: 'LTC', network: 'LTC', name: 'Litecoin' },
  { currency: 'USDC', network: 'ERC20', name: 'USD Coin' },
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('USDT_TRC20');
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>(DEFAULT_CRYPTOS);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/payment/create');
      if (response.ok) {
        const data = await response.json();
        if (data.currencies && data.currencies.length > 0) {
          setCryptos(data.currencies);
        }
      }
    } catch (error) {
      console.log('Using default crypto list');
    }
  };

  const handleSelectPlan = (planId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.info('Please login or register to continue');
      router.push(`/register?plan=${planId}`);
      return;
    }
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const [currency, network] = selectedCrypto.split('_');
      
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan,
          cryptoCurrency: currency,
          network: network,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment creation failed');
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        toast.success('Payment page opened in new tab');
        setShowPaymentModal(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#ec1313] selection:text-white">
      <div className="fixed inset-0 scanline-overlay z-50 opacity-20 pointer-events-none"></div>

      <header className="sticky top-0 z-40 w-full border-b border-[rgba(236,19,19,0.2)] bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 flex items-center justify-center border border-[rgba(236,19,19,0.4)]">
              <span className="material-symbols-outlined text-[#ec1313] text-2xl">star_rate</span>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ec1313]"></div>
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
              PKA291
            </h2>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(236,19,19,0.3)] to-transparent"></div>
          <div className="max-w-[1400px] mx-auto relative">
            <div className="text-center mb-24">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] mb-4 text-[#ec1313]">ACCESS_PROTOCOLS</h2>
              <h3 className="text-5xl font-black uppercase mb-6 tracking-tighter" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>CHOOSE_YOUR_LICENSE</h3>
              <div className="w-32 h-[2px] bg-[#ec1313] mx-auto mb-6"></div>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">SELECT OPERATIONAL TIER BELOW</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                plan.highlighted ? (
                  <div key={plan.id} className="relative group flex flex-col hover:scale-[1.05] transition-all duration-500 z-10">
                    <div className="absolute inset-0 bg-[#ec1313] blur-2xl opacity-10 animate-pulse"></div>
                    <div className="cyber-glass p-1 border-[#ec1313] relative">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ec1313] px-6 py-1 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                        MOST_WANTED
                      </div>
                      <div className="border border-[rgba(236,19,19,0.3)] p-8 flex flex-col h-full bg-[rgba(236,19,19,0.05)]">
                        <div className="mb-10">
                          <div className="flex justify-between items-start mb-6">
                            <h4 className="text-[10px] font-black text-[#ec1313] uppercase tracking-[0.4em]">{plan.codeName}</h4>
                            <span className="text-[8px] text-[rgba(236,19,19,0.6)] font-mono">ID: 00{index + 1}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter text-white" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                              ${plan.price}
                            </span>
                            <span className="text-[10px] font-bold text-[#ec1313] uppercase">{plan.period}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-2">{typeof plan.searches === 'number' ? `${plan.searches} searches/day` : 'Unlimited searches'}</p>
                        </div>
                        <div className="flex-1 space-y-3 mb-10 text-[10px]">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                              <span className="uppercase tracking-wider text-white font-bold">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSelectPlan(plan.id)}
                          className="bg-[#ec1313] hover:bg-white hover:text-[#ec1313] transition-all duration-300 w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(236,19,19,0.3)]"
                        >
                          {plan.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={plan.id} className="cyber-glass p-1 group flex flex-col hover:scale-[1.02] transition-transform duration-500">
                    <div className="border border-white/5 p-8 flex flex-col h-full bg-black/40">
                      <div className="mb-10">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="text-[10px] font-black text-[#ec1313] uppercase tracking-[0.4em]">{plan.codeName}</h4>
                          {plan.id === 'lifetime' ? (
                            <span className="text-[8px] border border-[rgba(236,19,19,0.4)] px-2 py-0.5 text-[#ec1313] font-bold tracking-widest font-black">LIFETIME</span>
                          ) : (
                            <span className="text-[8px] text-slate-500 font-bold tracking-widest">ID: 00{index + 1}</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{plan.period}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{typeof plan.searches === 'number' ? `${plan.searches} searches/day` : 'Unlimited searches'}</p>
                      </div>
                      <div className="flex-1 space-y-3 mb-10 text-[10px]">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                            <span className="uppercase tracking-wider text-slate-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                      {plan.id === 'lifetime' ? (
                        <button
                          onClick={() => handleSelectPlan(plan.id)}
                          className="border border-white text-white hover:bg-white hover:text-black transition-all duration-300 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          {plan.buttonText}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectPlan(plan.id)}
                          className="cyber-button w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          {plan.buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4 text-[#ec1313]">DETAILED_COMPARISON</h2>
              <h3 className="text-4xl font-black uppercase tracking-tighter" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                FEATURE_MATRIX
              </h3>
            </div>

            <div className="border border-[rgba(236,19,19,0.2)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(236,19,19,0.2)] bg-[rgba(236,19,19,0.03)]">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white">
                        FEATURE
                      </th>
                      {plans.map((plan) => (
                        <th
                          key={plan.id}
                          className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#ec1313]"
                        >
                          {plan.codeName.split('_')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[rgba(236,19,19,0.1)] hover:bg-[rgba(236,19,19,0.03)]">
                      <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Searches</td>
                      <td className="px-6 py-4 text-center text-white font-bold">100</td>
                      <td className="px-6 py-4 text-center text-white font-bold">300</td>
                      <td className="px-6 py-4 text-center text-white font-bold">500</td>
                      <td className="px-6 py-4 text-center text-[#ec1313] font-black">UNLIMITED</td>
                    </tr>
                    <tr className="border-b border-[rgba(236,19,19,0.1)] hover:bg-[rgba(236,19,19,0.03)]">
                      <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">API Access</td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                    </tr>
                    <tr className="border-b border-[rgba(236,19,19,0.1)] hover:bg-[rgba(236,19,19,0.03)]">
                      <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Telegram Integration</td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                    </tr>
                    <tr className="border-b border-[rgba(236,19,19,0.1)] hover:bg-[rgba(236,19,19,0.03)]">
                      <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Support</td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-slate-600 text-lg">cancel</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                    </tr>
                    <tr className="hover:bg-[rgba(236,19,19,0.03)]">
                      <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Dedicated Manager</td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-slate-600 text-lg">cancel</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-slate-600 text-lg">cancel</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                      <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-[#0bda0b] text-lg">check_circle</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4 text-[#ec1313]">FAQ_SECTION</h2>
              <h3 className="text-4xl font-black uppercase tracking-tighter" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                FREQUENTLY_ASKED
              </h3>
            </div>

            <div className="space-y-4">
              <div className="cyber-glass p-6 border-l-4 border-l-[#ec1313]">
                <h4 className="text-sm font-black uppercase mb-2 text-white">Can I upgrade or downgrade anytime?</h4>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Yes, you can change your plan at any time. Changes will take effect on your next billing cycle.
                </p>
              </div>

              <div className="cyber-glass p-6 border-l-4 border-l-[#ec1313]">
                <h4 className="text-sm font-black uppercase mb-2 text-white">Do you offer refunds?</h4>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  We offer a 30-day money-back guarantee if you're not satisfied with our service.
                </p>
              </div>

              <div className="cyber-glass p-6 border-l-4 border-l-[#ec1313]">
                <h4 className="text-sm font-black uppercase mb-2 text-white">What payment methods do you accept?</h4>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  We accept cryptocurrency payments including Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Litecoin (LTC), and USD Coin (USDC) via secure Heleket payment gateway.
                </p>
              </div>

              <div className="cyber-glass p-6 border-l-4 border-l-[#ec1313]">
                <h4 className="text-sm font-black uppercase mb-2 text-white">How do referral rewards work?</h4>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Earn 10% commission on every payment made by users you refer. Share your unique referral code and earn rewards when they upgrade to a paid plan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showPaymentModal && selectedPlanDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="cyber-glass w-full max-w-md p-6 border border-[rgba(236,19,19,0.3)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>Complete Payment</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Pay with cryptocurrency</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 border border-[rgba(236,19,19,0.2)] bg-[rgba(236,19,19,0.05)]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase text-white">{selectedPlanDetails.codeName}</span>
                <span className="text-2xl font-black text-[#ec1313]">${selectedPlanDetails.price}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{selectedPlanDetails.duration}</p>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#ec1313] mb-2">
                Select Cryptocurrency
              </label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger className="w-full bg-black border-[rgba(236,19,19,0.3)] text-white">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(236,19,19,0.3)]">
                  {cryptos.map((crypto) => (
                    <SelectItem
                      key={`${crypto.currency}_${crypto.network}`}
                      value={`${crypto.currency}_${crypto.network}`}
                      className="text-white hover:bg-[rgba(236,19,19,0.1)]"
                    >
                      {crypto.name || `${crypto.currency} (${crypto.network})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mb-6 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0bda0b] text-sm">check_circle</span>
                <span className="uppercase tracking-wider text-slate-400">Secure payment via Heleket</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0bda0b] text-sm">check_circle</span>
                <span className="uppercase tracking-wider text-slate-400">Instant activation after payment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0bda0b] text-sm">check_circle</span>
                <span className="uppercase tracking-wider text-slate-400">24/7 payment support</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="cyber-button w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bitcoin className="w-4 h-4" />
                  Pay ${selectedPlanDetails.price} with Crypto
                </>
              )}
            </button>

            <p className="text-[9px] text-slate-600 text-center mt-4 uppercase tracking-widest">
              By completing this payment, you agree to our Terms of Service
            </p>
          </div>
        </div>
      )}

      <footer className="py-20 px-6 border-t border-[rgba(236,19,19,0.2)] bg-black">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#ec1313] text-2xl">star_rate</span>
                <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                  PKA291
                </h2>
              </div>
              <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-mono max-w-xs">
                PREMIUM_OPERATIONAL_OSINT_ARCHITECTURE_V2.9.1_STABLE
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-[#ec1313] font-black uppercase tracking-widest">_PRODUCT</span>
                <Link href="/pricing" className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
                  Pricing
                </Link>
                <Link href="/#features" className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
                  Features
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-[#ec1313] font-black uppercase tracking-widest">_LEGAL</span>
                <Link href="/privacy" className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
                  Terms
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-[#ec1313] font-black uppercase tracking-widest">_SOCIAL</span>
                <a className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors" href="https://t.me/pka291_osint" target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[rgba(236,19,19,0.2)]">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest text-center font-mono">
              © 2024 PKA291 | ENCRYPTED_TUNNEL: AES-256-GCM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
