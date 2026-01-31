'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black dark:bg-black text-white selection:bg-[#ec1313] selection:text-white">
      <div className="fixed inset-0 scanline-overlay z-50 opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[rgba(236,19,19,0.2)] bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 flex items-center justify-center border border-[rgba(236,19,19,0.4)]">
              <span className="material-symbols-outlined text-[#ec1313] text-2xl">star_rate</span>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ec1313]"></div>
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
              PKA291
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <a className="text-[11px] font-bold hover:text-[#ec1313] transition-colors uppercase tracking-[0.3em]" href="#features">
              // CAPABILITIES
            </a>
            <a href="#pricing" className="text-[11px] font-bold hover:text-[#ec1313] transition-colors uppercase tracking-[0.3em]">
              // PRICING
            </a>
            <Link href="/docs" className="text-[11px] font-bold hover:text-[#ec1313] transition-colors uppercase tracking-[0.3em]">
              // DOCS
            </Link>
            <Link href="/terms" className="text-[11px] font-bold hover:text-[#ec1313] transition-colors uppercase tracking-[0.3em]">
              // TERMS
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:flex h-10 px-6 items-center justify-center border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              LOGIN_
            </Link>
            <Link
              href="/register"
              className="cyber-button h-10 px-6 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"
            >
              LAUNCH_CONSOLE
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="relative border border-[rgba(236,19,19,0.2)] bg-black min-h-[600px] flex flex-col items-center justify-center text-center p-12 overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#ec1313 1px, transparent 1px)', backgroundSize: '30px 30px' }}
              ></div>

              <div className="relative inline-flex items-center gap-3 px-4 py-1 border border-[rgba(236,19,19,0.5)] text-[#ec1313] text-[10px] font-bold uppercase tracking-[0.4em] mb-10 bg-[rgba(236,19,19,0.05)]">
                <span className="w-2 h-2 bg-[#ec1313] animate-pulse"></span>
                CORE_SYSTEM: STABLE_
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter uppercase mb-8" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                PKA291
                <br />
                <span style={{ color: '#ec1313' }}>OSINT_ARCH</span>
              </h1>

              <p className="text-slate-400 max-w-2xl mb-12 leading-relaxed text-sm uppercase tracking-wider font-light">
                [REDACTED] data harvesting. Real-time API monitoring. <br />
                Advanced node routing for tactical investigation superiority.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="/register"
                  className="cyber-button h-16 px-12 text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(236,19,19,0.2)] flex items-center justify-center"
                >
                  INITIALIZE_ACCESS
                </Link>
                <Link
                  href="#pricing"
                  className="h-16 px-12 border border-white/10 bg-white/5 backdrop-blur text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  VIEW_PRICING
                </Link>
              </div>

              <div className="absolute bottom-8 left-8 text-[9px] font-mono text-[rgba(236,19,19,0.4)] text-left hidden lg:block uppercase tracking-widest leading-loose">
                LOC_REF: 52.5200 N, 13.4050 E
                <br />
                PROTOCOL: SHADOW_ROUTE_V4
                <br />
                ENCRYPT: AES_XTS_512
              </div>

              <div className="absolute bottom-8 right-8 text-[9px] font-mono text-[rgba(236,19,19,0.4)] text-right hidden lg:block uppercase tracking-widest leading-loose">
                SYS_LOAD: 0.14
                <br />
                UPLINK: 10GBPS_FIBER
                <br />
                ID: PKA_USER_UNNAMED
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[rgba(236,19,19,0.2)]">
              <div className="p-10 border-r border-[rgba(236,19,19,0.2)] hover:bg-[rgba(236,19,19,0.03)] transition-colors">
                <p className="text-[10px] font-bold text-[rgba(236,19,19,0.6)] uppercase tracking-[0.3em] mb-6">ACTIVE_NODES</p>
                <div className="flex items-baseline gap-4">
                  <p className="text-5xl font-black tracking-tighter">1,284</p>
                  <span className="text-[#0bda0b] text-[10px] font-bold">[+12%]</span>
                </div>
              </div>

              <div className="p-10 border-r border-[rgba(236,19,19,0.2)] hover:bg-[rgba(236,19,19,0.03)] transition-colors">
                <p className="text-[10px] font-bold text-[rgba(236,19,19,0.6)] uppercase tracking-[0.3em] mb-6">QUERIES_TOTAL</p>
                <div className="flex items-baseline gap-4">
                  <p className="text-5xl font-black tracking-tighter">4.2M</p>
                  <span className="text-[#0bda0b] text-[10px] font-bold">[+05%]</span>
                </div>
              </div>

              <div className="p-10 hover:bg-[rgba(236,19,19,0.03)] transition-colors">
                <p className="text-[10px] font-bold text-[rgba(236,19,19,0.6)] uppercase tracking-[0.3em] mb-6">LATENCY_AVG</p>
                <div className="flex items-baseline gap-4">
                  <p className="text-5xl font-black tracking-tighter">84ms</p>
                  <span className="text-[#ec1313] text-[10px] font-bold">[-14%]</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6" id="features">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-24">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4 text-[#ec1313]">CORE_COMPETENCIES</h2>
              <h3 className="text-5xl font-black uppercase tracking-tighter" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                SYSTEM_CAPABILITIES
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="cyber-glass p-12 border-l-4 border-l-[#ec1313] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:opacity-20 transition-opacity">01</div>
                <span className="material-symbols-outlined text-[#ec1313] text-4xl mb-8">shield_lock</span>
                <h4 className="text-xl font-black uppercase mb-4 tracking-tight">SHIELD_ARCH</h4>
                <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-wider">
                  End-to-end multi-layer encryption. Queries are routed through polymorphic nodes to ensure absolute anonymity.
                </p>
              </div>

              <div className="cyber-glass p-12 border-l-4 border-l-[#ec1313] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:opacity-20 transition-opacity">02</div>
                <span className="material-symbols-outlined text-[#ec1313] text-4xl mb-8">monitoring</span>
                <h4 className="text-xl font-black uppercase mb-4 tracking-tight">API_MONITOR</h4>
                <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-wider">
                  Dynamic monitoring of endpoint health and traffic flow. Real-time logging with custom administrative triggers.
                </p>
              </div>

              <div className="cyber-glass p-12 border-l-4 border-l-[#ec1313] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:opacity-20 transition-opacity">03</div>
                <span className="material-symbols-outlined text-[#ec1313] text-4xl mb-8">public</span>
                <h4 className="text-xl font-black uppercase mb-4 tracking-tight">GLOBAL_INDEX</h4>
                <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-wider">
                  Direct uplink to proprietary data pools and indexed leak archives. Updated at 60-minute intervals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-32 px-6 relative overflow-hidden" id="pricing">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(236,19,19,0.3)] to-transparent"></div>
          <div className="max-w-[1400px] mx-auto relative">
            <div className="text-center mb-24">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] mb-4 text-[#ec1313]">ACCESS_PROTOCOLS</h2>
              <h3 className="text-5xl font-black uppercase mb-6 tracking-tighter">CHOOSE_YOUR_LICENSE</h3>
              <div className="w-32 h-[2px] bg-[#ec1313] mx-auto mb-6"></div>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">SELECT OPERATIONAL TIER BELOW</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Monthly */}
              <div className="cyber-glass p-1 group flex flex-col hover:scale-[1.02] transition-transform duration-500">
                <div className="border border-white/5 p-8 flex flex-col h-full bg-black/40">
                  <div className="mb-10">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-[10px] font-black text-[#ec1313] uppercase tracking-[0.4em]">BASIC_ID</h4>
                      <span className="text-[8px] text-slate-500 font-bold tracking-widest">ID: 001</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">$20</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">/ MO</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">100 searches/day</p>
                  </div>
                  <div className="flex-1 space-y-3 mb-10 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">100 searches/day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Basic API Auth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Support: Email</span>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="cyber-button w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    SELECT_TIER
                  </Link>
                </div>
              </div>

              {/* Quarterly */}
              <div className="cyber-glass p-1 group flex flex-col hover:scale-[1.02] transition-transform duration-500">
                <div className="border border-white/5 p-8 flex flex-col h-full bg-black/40">
                  <div className="mb-10">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-[10px] font-black text-[#ec1313] uppercase tracking-[0.4em]">TACTICAL_ID</h4>
                      <span className="text-[8px] text-slate-500 font-mono">ID: 002</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">$50</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">/ 3MO</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">300 searches/day</p>
                  </div>
                  <div className="flex-1 space-y-3 mb-10 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">300 searches/day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Priority Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Priority Support</span>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="cyber-button w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    SELECT_TIER
                  </Link>
                </div>
              </div>

              {/* Yearly - Featured */}
              <div className="relative group flex flex-col hover:scale-[1.05] transition-all duration-500 z-10">
                <div className="absolute inset-0 bg-[#ec1313] blur-2xl opacity-10 animate-pulse"></div>
                <div className="cyber-glass p-1 border-[#ec1313] relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ec1313] px-6 py-1 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                    MOST_WANTED
                  </div>
                  <div className="border border-[rgba(236,19,19,0.3)] p-8 flex flex-col h-full bg-[rgba(236,19,19,0.05)]">
                    <div className="mb-10">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-[10px] font-black text-[#ec1313] uppercase tracking-[0.4em]">ELITE_ID</h4>
                        <span className="text-[8px] text-[rgba(236,19,19,0.6)] font-mono">ID: 003</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter text-white" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
                          $100
                        </span>
                        <span className="text-[10px] font-bold text-[#ec1313] uppercase">/ 3MO</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2">500 searches/day</p>
                    </div>
                    <div className="flex-1 space-y-3 mb-10 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                        <span className="uppercase tracking-wider text-white font-bold">500 searches/day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                        <span className="uppercase tracking-wider text-white font-bold">Custom Indexing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                        <span className="uppercase tracking-wider text-white font-bold">24/7_Support</span>
                      </div>
                    </div>
                    <Link
                      href="/register"
                      className="bg-[#ec1313] hover:bg-white hover:text-[#ec1313] transition-all duration-300 w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(236,19,19,0.3)]"
                    >
                      INITIALIZE_ELITE
                    </Link>
                  </div>
                </div>
              </div>

              {/* Lifetime */}
              <div className="cyber-glass p-1 group flex flex-col hover:scale-[1.02] transition-transform duration-500">
                <div className="border border-white/5 p-8 flex flex-col h-full bg-black/40">
                  <div className="mb-10">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-[10px] font-black text-[#ec1313] uppercase tracking-[0.4em]">TERMINAL_ID</h4>
                      <span className="text-[8px] border border-[rgba(236,19,19,0.4)] px-2 py-0.5 text-[#ec1313] font-bold tracking-widest font-black">LIFETIME</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">$300</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">TOTAL</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Unlimited searches</p>
                  </div>
                  <div className="flex-1 space-y-3 mb-10 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Unlimited Searches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Dedicated Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ec1313] text-sm">check_circle</span>
                      <span className="uppercase tracking-wider text-slate-400">Infinite_Tokens</span>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="border border-white text-white hover:bg-white hover:text-black transition-all duration-300 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    CLAIM_LIFETIME
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
                <a className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors" href="/pricing">
                  Pricing
                </a>
                <a className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors" href="#features">
                  Features
                </a>
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
