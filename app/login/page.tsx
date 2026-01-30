'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'apikey'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing session
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          loginMethod === 'credentials'
            ? { username, password }
            : { apiKey }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store token and redirect
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      
      // Also set a cookie for server-side compatibility if needed
      document.cookie = `authToken=${data.token}; path=/; max-age=604800; SameSite=Strict`;
      document.cookie = `userId=${data.userId}; path=/; max-age=604800; SameSite=Strict`;
      
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 scanline-overlay z-0 opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md lg:max-w-sm">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center border border-[#ec1313] relative">
              <span className="material-symbols-outlined text-[#ec1313] text-xl">star_rate</span>
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#ec1313]"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-[#ec1313]" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
              PKA291
            </h1>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">SECURE_ACCESS_PORTAL</p>
        </div>

        {/* Login Container */}
        <div className="cyber-glass border border-[rgba(236,19,19,0.2)] p-8 space-y-6">
          {/* Login Method Tabs */}
          <div className="flex gap-2 border-b border-[rgba(236,19,19,0.2)]">
            <button
              onClick={() => setLoginMethod('credentials')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                loginMethod === 'credentials'
                  ? 'text-[#ec1313] border-b-2 border-[#ec1313]'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Username
            </button>
            <button
              onClick={() => setLoginMethod('apikey')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                loginMethod === 'apikey'
                  ? 'text-[#ec1313] border-b-2 border-[#ec1313]'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              API Key
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMethod === 'credentials' ? (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313]"
                    placeholder="Enter username"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313]"
                    placeholder="Enter password"
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313]"
                  placeholder="Paste your API key"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm font-bold border border-red-500/20 bg-red-500/10 p-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cyber-button w-full py-3 text-sm font-black uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login_'}
            </button>
          </form>

          <div className="border-t border-[rgba(236,19,19,0.2)] pt-4 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#ec1313] hover:underline font-bold">
                CREATE_HERE
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          ENCRYPTED: AES-256-GCM
        </div>
      </div>
    </div>
  );
}
