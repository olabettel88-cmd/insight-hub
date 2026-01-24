'use client';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 scanline-overlay z-0 opacity-20 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
            DOCUMENTATION
          </h1>
          <p className="text-slate-400 text-lg uppercase tracking-widest font-light">
            API Reference & Integration Guide
          </p>
        </div>

        {/* Getting Started */}
        <section className="mb-16 pb-16 border-b border-[rgba(236,19,19,0.2)]">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-[#ec1313]">Getting Started</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Welcome to PKA291 OSINT Platform. This documentation covers all available APIs and integration methods.
            </p>
            <p>
              All endpoints require authentication via API Key. You can generate your API key from your dashboard after registration.
            </p>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-16 pb-16 border-b border-[rgba(236,19,19,0.2)]">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-[#ec1313]">Authentication</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold uppercase mb-3">API Key Authentication</h3>
              <div className="bg-black/40 border border-[rgba(236,19,19,0.2)] p-4 rounded font-mono text-sm">
                <p className="text-slate-400">curl -H "Authorization: Bearer YOUR_API_KEY" https://api.pka291.osint/search</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase mb-3">Header Format</h3>
              <p className="text-slate-300">Include your API key in the Authorization header as a Bearer token.</p>
            </div>
          </div>
        </section>

        {/* Search Endpoint */}
        <section className="mb-16 pb-16 border-b border-[rgba(236,19,19,0.2)]">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-[#ec1313]">Search Endpoint</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold uppercase mb-3">POST /api/search</h3>
              <p className="text-slate-300 mb-4">Perform a search query across the platform.</p>
              
              <div>
                <h4 className="font-bold uppercase text-[#ec1313] mb-2">Request Body</h4>
                <div className="bg-black/40 border border-[rgba(236,19,19,0.2)] p-4 rounded font-mono text-xs mb-4">
                  <p>{`{`}</p>
                  <p className="ml-4">{`"type": "email|domain|username|phone",`}</p>
                  <p className="ml-4">{`"query": "example@email.com"`}</p>
                  <p>{`}`}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase text-[#ec1313] mb-2">Response</h4>
                <div className="bg-black/40 border border-[rgba(236,19,19,0.2)] p-4 rounded font-mono text-xs">
                  <p>{`{`}</p>
                  <p className="ml-4">{`"success": true,`}</p>
                  <p className="ml-4">{`"results": [...],`}</p>
                  <p className="ml-4">{`"count": 5`}</p>
                  <p>{`}`}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-16 pb-16 border-b border-[rgba(236,19,19,0.2)]">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-[#ec1313]">Rate Limits</h2>
          <div className="space-y-4 text-slate-300">
            <p>Rate limits are applied per subscription tier:</p>
            <ul className="space-y-2 ml-6 list-disc">
              <li>Free: 1 search per day</li>
              <li>Monthly: 100 searches per day</li>
              <li>Quarterly: 300 searches per day</li>
              <li>Yearly: 500 searches per day</li>
              <li>Lifetime: Unlimited searches</li>
            </ul>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-[#ec1313]">Support</h2>
          <div className="space-y-4 text-slate-300">
            <p>For API support and questions, contact us via Telegram:</p>
            <p className="text-[#ec1313] font-bold">t.me/pka291_osint</p>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-[rgba(236,19,19,0.2)] text-center text-slate-600 text-sm">
          <p>PKA291 © 2024 | ENCRYPTED: AES-256-GCM</p>
        </div>
      </div>
    </div>
  );
}
