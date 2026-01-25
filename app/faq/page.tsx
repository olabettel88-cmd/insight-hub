'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FAQPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is PKA291 OSINT Platform?',
      answer: 'PKA291 is a comprehensive Open Source Intelligence (OSINT) platform designed for advanced data gathering, analysis, and investigation. It provides secure access to multiple data sources through a unified interface.',
    },
    {
      question: 'How do I get started?',
      answer: 'Simply create an account with a username and password. You\'ll receive an API key immediately which you can use to authenticate requests. The free tier includes 1 search per day.',
    },
    {
      question: 'What search types are supported?',
      answer: 'We support email lookups, domain analysis, username searches, phone number lookups, and breach database queries. All searches are powered by our proprietary intelligence network.',
    },
    {
      question: 'How many searches can I perform?',
      answer: 'It depends on your subscription: Free (1/day), Monthly ($50 - 100/day), Quarterly (300/day), Yearly (500/day), or Lifetime (unlimited).',
    },
    {
      question: 'Can I use the Telegram bot?',
      answer: 'Yes! Generate a Telegram connection code from your dashboard and use our bot (@pka291_osint) to perform searches directly on Telegram.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. All data is encrypted with AES-256-GCM, transmitted over HTTPS, and stored securely. We implement military-grade security protocols and regular audits.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and cryptocurrency payments through our secure payment processor. All transactions are encrypted and PCI-DSS compliant.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 7-day money-back guarantee for monthly plans. Lifetime and quarterly plans are non-refundable but offer exceptional value.',
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach our support team via Telegram at t.me/pka291_osint. We typically respond within 24 hours.',
    },
    {
      question: 'Do you offer API access?',
      answer: 'Yes! All users get API access with their subscription. Check our documentation for full API reference and integration guides.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 scanline-overlay z-0 opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-[rgba(236,19,19,0.2)] bg-black/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity select-none">
            <div className="relative w-10 h-10 flex items-center justify-center border border-[rgba(236,19,19,0.4)]">
              <span className="material-symbols-outlined text-[#ec1313] text-2xl">star_rate</span>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ec1313]"></div>
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
              PKA291
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/docs" className="text-[11px] font-bold hover:text-[#ec1313] uppercase tracking-[0.3em] transition-colors">
              // DOCS
            </Link>
            <Link href="/faq" className="text-[11px] font-bold text-[#ec1313] uppercase tracking-[0.3em]">
              // FAQ
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
            FAQ
          </h1>
          <p className="text-slate-400 text-lg uppercase tracking-widest font-light">
            Frequently Asked Questions
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[rgba(236,19,19,0.2)] hover:border-[rgba(236,19,19,0.4)] transition-colors"
            >
              <button
                onClick={() => setExpanded(expanded === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-[rgba(236,19,19,0.02)] transition-colors group"
              >
                <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-[#ec1313] transition-colors">
                  {faq.question}
                </h3>
                <span className="text-[#ec1313] text-xl flex-shrink-0 ml-4">
                  {expanded === index ? '−' : '+'}
                </span>
              </button>
              {expanded === index && (
                <div className="px-6 pb-6 border-t border-[rgba(236,19,19,0.1)] pt-4">
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 pt-8 border-t border-[rgba(236,19,19,0.2)]">
          <h2 className="text-2xl font-black uppercase mb-6 text-[#ec1313]">Still have questions?</h2>
          <p className="text-slate-300 mb-4">
            Our support team is available on Telegram to help with any questions or issues.
          </p>
          <a
            href="https://t.me/pka291_osint"
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-button h-12 px-8 text-sm font-black uppercase tracking-widest inline-flex items-center justify-center"
          >
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-[rgba(236,19,19,0.2)] text-center text-slate-600 text-sm">
          <p>PKA291 © 2024 | ENCRYPTED: AES-256-GCM</p>
        </div>
      </div>
    </div>
  );
}
