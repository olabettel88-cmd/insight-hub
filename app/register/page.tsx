'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'api-key' | 'referral'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/auth/captcha?t=${Date.now()}`);
    setCaptchaInput('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password || !confirmPassword || !captchaInput) {
      setError('All fields including captcha are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          referralCode: referralCode || null,
          captcha: captchaInput
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      localStorage.setItem('authToken', data.token || data.accessToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);

      setApiKey(data.apiKey);
      setStep('api-key');
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    setStep('referral');
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 scanline-overlay z-0 opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md lg:max-w-sm">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 flex items-center justify-center border border-[#ec1313] relative">
              <span className="material-symbols-outlined text-[#ec1313] text-xl">star_rate</span>
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#ec1313]"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-[#ec1313]" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
              PKA291
            </h1>
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">INITIALIZE_ACCESS</p>
        </div>

        {/* Step 1: Registration */}
        {step === 'register' && (
          <div className="cyber-glass border border-[rgba(236,19,19,0.2)] p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-1 text-white">Create Account</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">USERNAME + PASSWORD</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313]"
                  placeholder="Choose username"
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

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313]"
                  placeholder="Confirm password"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Referral Code (Optional)
                </label>
                <Input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313]"
                  placeholder="Enter referral code"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Security Verification
                </label>
                <div className="flex gap-3 items-center">
                  <div 
                    className="relative bg-black border border-[rgba(236,19,19,0.2)] rounded w-36 h-12 flex-shrink-0 cursor-pointer group overflow-hidden"
                    onClick={refreshCaptcha}
                    title="Click to refresh captcha"
                  >
                    {captchaUrl ? (
                      <img 
                        src={captchaUrl} 
                        alt="Captcha Code" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">Loading...</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none"></div>
                  </div>
                  <Input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    className="h-12 flex-1 bg-black/40 border border-[rgba(236,19,19,0.2)] text-white placeholder-slate-600 focus:border-[#ec1313] uppercase tracking-widest font-bold text-lg text-center"
                    placeholder="ENTER CODE"
                    disabled={loading}
                  />
                </div>
              </div>

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
                {loading ? 'Creating...' : 'Create_Account'}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#ec1313] hover:underline font-bold">
                    LOGIN_HERE
                  </Link>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: API Key */}
        {step === 'api-key' && (
          <div className="cyber-glass border border-[rgba(236,19,19,0.2)] p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-1 text-white">Your API Key</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">PROTECT_THIS_KEY</p>
            </div>

            <div className="bg-black/40 border-2 border-[rgba(236,19,19,0.5)] p-4 rounded space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ec1313]">API_KEY_GENERATED</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/50 p-3 rounded text-[#ec1313] font-bold tracking-widest text-[11px] sm:text-xs break-all border border-[#ec1313]/20 shadow-[0_0_10px_rgba(236,19,19,0.2)] leading-relaxed">
                  {apiKey}
                </code>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 hover:bg-[#ec1313]/20 rounded transition-colors border border-transparent hover:border-[#ec1313]/30"
                >
                  <span className="material-symbols-outlined text-lg text-[#ec1313]">{copied ? 'check_circle' : 'content_copy'}</span>
                </button>
              </div>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">
                Store this key securely. You will not see it again. Use it to authenticate API requests or login.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest leading-relaxed">
                ⚠️ WARNING: Store this key securely. You will not see it again. Use it to authenticate API requests or login.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="cyber-button w-full py-3 text-sm font-black uppercase tracking-widest"
            >
              Continue_
            </button>
          </div>
        )}

        {/* Step 3: Referral */}
        {step === 'referral' && (
          <div className="cyber-glass border border-[rgba(236,19,19,0.2)] p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-1 text-white">Referral Program</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">GET 25% DISCOUNT_FOREVER</p>
            </div>

            <div className="space-y-4 text-xs text-slate-300 uppercase tracking-wider">
              <div className="bg-[rgba(236,19,19,0.1)] border border-[rgba(236,19,19,0.2)] p-4 rounded">
                <p className="font-bold text-[#ec1313] mb-2">HOW_IT_WORKS:</p>
                <ul className="space-y-1 text-slate-400 leading-relaxed">
                  <li>✓ You get a unique referral code</li>
                  <li>✓ Share it with others</li>
                  <li>✓ When they upgrade → 25% off forever for both</li>
                  <li>✓ Works on all plans, stacks forever</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="cyber-button w-full py-3 text-sm font-black uppercase tracking-widest"
            >
              Go_to_Dashboard
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          PKA291 2026
        </div>
      </div>
    </div>
  );
}
