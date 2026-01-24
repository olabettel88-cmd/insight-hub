'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Check,
  X,
  Zap,
  TrendingUp,
  Crown,
  Infinity,
  Lock,
  Clock,
  AlertCircle,
} from 'lucide-react';

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
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 50,
    period: '/month',
    duration: 'Billed monthly',
    searches: 100,
    features: [
      '100 searches per day',
      'Email, domain, username lookups',
      'Basic analytics',
      'Email support',
      'Connect Telegram',
      'API access',
    ],
    highlighted: false,
    icon: <Zap className="w-6 h-6" />,
    buttonText: 'Get Started',
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 50,
    period: '/month (billed 3x/year)',
    duration: 'Every 3 months',
    searches: 300,
    features: [
      '300 searches per day',
      'All Monthly features',
      'Advanced analytics',
      'Priority support',
      'Custom API rate limits',
      'Saved searches',
    ],
    highlighted: true,
    icon: <TrendingUp className="w-6 h-6" />,
    buttonText: 'Most Popular',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 100,
    period: '/month (billed 1x/year)',
    duration: 'Billed once per year',
    searches: 500,
    features: [
      '500 searches per day',
      'All Quarterly features',
      'Premium analytics',
      '24/7 priority support',
      'Dedicated account manager',
      'Custom integrations',
    ],
    highlighted: false,
    icon: <Crown className="w-6 h-6" />,
    buttonText: 'Best Value',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 300,
    period: 'one-time',
    duration: 'One-time payment',
    searches: 'unlimited',
    features: [
      'Unlimited searches',
      'All Yearly features',
      'Priority API access',
      'Lifetime support',
      'Early access to new features',
      'Custom branding options',
    ],
    highlighted: false,
    icon: <Infinity className="w-6 h-6" />,
    buttonText: 'Go Lifetime',
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // In production, redirect to checkout
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-foreground">
            OSINT Platform
          </Link>
          <Link
            href="/login"
            className="text-primary hover:text-accent transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Pricing Plans
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose the perfect plan for your OSINT intelligence gathering needs
        </p>

        {/* Trial Banner */}
        <Card className="mb-12 p-4 bg-primary/10 border-primary/30 inline-block">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Free account: 1 search per day</span>
          </div>
        </Card>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative transition-all ${
                plan.highlighted ? 'md:scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <div className="bg-primary px-4 py-1 rounded-full text-sm font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                </div>
              )}

              <Card
                className={`h-full p-6 flex flex-col transition-all cursor-pointer hover:border-primary/50 ${
                  plan.highlighted
                    ? 'bg-card border-primary/50 shadow-lg'
                    : 'bg-card/50 border-border/50'
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {/* Plan Icon & Name */}
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.duration}</p>
                </div>

                {/* Searches */}
                <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border/30">
                  <p className="text-sm font-semibold text-foreground">
                    {typeof plan.searches === 'number'
                      ? `${plan.searches} searches`
                      : 'Unlimited searches'}
                  </p>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Detailed Feature Comparison
        </h2>

        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-6 py-4 text-center font-semibold text-foreground"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground">Daily Searches</td>
                  <td className="px-6 py-4 text-center">100</td>
                  <td className="px-6 py-4 text-center">300</td>
                  <td className="px-6 py-4 text-center">500</td>
                  <td className="px-6 py-4 text-center text-primary font-semibold">
                    Unlimited
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground">API Access</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground">Telegram Integration</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground">Priority Support</td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground">Dedicated Manager</td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold text-foreground mb-2">
              Can I upgrade or downgrade anytime?
            </h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Changes will take effect on
              your next billing cycle.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold text-foreground mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee if you're not satisfied with our
              service.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold text-foreground mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and cryptocurrency (Bitcoin,
              Ethereum).
            </p>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-y border-border/50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start?</h2>
          <p className="text-muted-foreground mb-8">
            Get your free account now and start gathering intelligence with OSINT Platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-border/50 px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
