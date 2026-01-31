'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, LogOut, Zap, TrendingUp, Crown, CreditCard, 
  Terminal, Shield, Globe, Database, Eye, EyeOff, 
  Server, Smartphone, User, Wifi, MapPin, Gamepad2, 
  Ghost, FileText, Lock, AlertTriangle, Hash, Mail, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// --- Interfaces ---

interface UserStats {
  username: string;
  searchesUsed: number;
  searchesLimit: number;
  planType: string;
  apiKey: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  icon: React.ReactNode;
}

// --- Constants & Data ---

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 20,
    period: '/ MO',
    features: ['100 searches/day', 'Basic API Auth', 'Support: Email'],
    highlighted: false,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 50,
    period: '/ 3MO',
    features: ['300 searches/day', 'Priority Nodes', 'Priority Support'],
    highlighted: false,
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 100,
    period: '/ YEAR',
    features: ['500 searches/day', 'Custom Indexing', '24/7 Support'],
    highlighted: true,
    icon: <Crown className="w-5 h-5" />,
  },
];

const categories = [
  {
    name: 'Main',
    items: [
      { id: 'home', label: 'Dashboard', icon: <Terminal className="w-4 h-4" /> },
    ]
  },
  {
    name: 'OSINT Tools',
    items: [
      { id: 'email-osint', label: 'Email OSINT', icon: <Mail className="w-4 h-4" /> },
      { id: 'username-search', label: 'Username Search', icon: <User className="w-4 h-4" /> },
      { id: 'twitter-osint', label: 'Twitter OSINT', icon: <Hash className="w-4 h-4" /> },
      { id: 'phone-lookup', label: 'Phone Lookup', icon: <Smartphone className="w-4 h-4" /> },
      { id: 'github-osint', label: 'Github OSINT', icon: <FileText className="w-4 h-4" /> },
      { id: 'us-npd', label: 'US NPD Search', icon: <Database className="w-4 h-4" /> },
      { id: 'ip-lookup', label: 'IP Lookup', icon: <Globe className="w-4 h-4" /> },
      { id: 'dns-resolver', label: 'DNS Resolver', icon: <Wifi className="w-4 h-4" /> },
      { id: 'datahound', label: 'Datahound', icon: <Search className="w-4 h-4" /> },
      { id: 'vin-lookup', label: 'VIN Lookup', icon: <MapPin className="w-4 h-4" /> },
    ]
  },
  {
    name: 'Gaming & Social',
    items: [
      { id: 'discord-lookup', label: 'Discord Lookup', icon: <Gamepad2 className="w-4 h-4" /> },
      { id: 'discord-monitor', label: 'Discord Monitor', icon: <Eye className="w-4 h-4" /> },
      { id: 'discord-roblox', label: 'Discord to Roblox', icon: <Gamepad2 className="w-4 h-4" /> },
      { id: 'roblox-lookup', label: 'Roblox Lookup', icon: <Gamepad2 className="w-4 h-4" /> },
      { id: 'minecraft-lookup', label: 'Minecraft Lookup', icon: <Gamepad2 className="w-4 h-4" /> },
      { id: 'crowsint', label: 'Crowsint', icon: <Ghost className="w-4 h-4" /> },
    ]
  },
  {
    name: 'Breach Data',
    items: [
      { id: 'stealer-logs', label: 'Stealer Logs', icon: <FileText className="w-4 h-4" /> },
      { id: 'email-breach', label: 'Email Breach', icon: <Lock className="w-4 h-4" /> },
      { id: 'username-breach', label: 'Username Breach', icon: <User className="w-4 h-4" /> },
      { id: 'phone-breach', label: 'Phone Breach', icon: <Smartphone className="w-4 h-4" /> },
      { id: 'intelx-file', label: 'IntelX File Retriever', icon: <Database className="w-4 h-4" /> },
      { id: 'intelx-id', label: 'IntelX Identity', icon: <User className="w-4 h-4" /> },
      { id: 'subdomain', label: 'Subdomain Finder', icon: <Globe className="w-4 h-4" /> },
      { id: 'shodan', label: 'Shodan', icon: <Server className="w-4 h-4" /> },
    ]
  }
];

// --- Components ---

const FireAvatar = () => (
  <div className="relative w-10 h-10 flex items-center justify-center bg-black border border-[#ec1313] group z-50">
    <div className="absolute inset-0 bg-red-600/20 blur-md animate-pulse"></div>
    {/* Anime Style Floating Fire */}
    <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-20 w-8 bg-[#ec1313] blur-xl animate-pulse opacity-60 mix-blend-screen pointer-events-none"></div>
    <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-20 w-8 bg-[#ec1313] blur-xl animate-pulse delay-100 opacity-60 mix-blend-screen pointer-events-none"></div>
    <span className="relative z-10 font-black text-[#ec1313] text-xl font-mono drop-shadow-[0_0_8px_rgba(236,19,19,0.8)]">P</span>
  </div>
);

const ToolPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col h-full animate-in fade-in duration-500">
    <div className="mb-6 border-b border-[#ec1313]/30 pb-4">
      <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
        <span className="w-2 h-8 bg-[#ec1313]"></span>
        {title}
      </h2>
      <p className="text-xs text-[#ec1313] mt-1 font-mono uppercase tracking-widest">AWAITING_INPUT // SYSTEM_READY</p>
    </div>

    <Card className="flex-1 bg-black/40 border border-[#ec1313]/30 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 scanline-overlay opacity-30 pointer-events-none"></div>
      <div className="w-24 h-24 rounded-full border border-[#ec1313]/30 flex items-center justify-center mb-6 bg-[#ec1313]/5">
        <Terminal className="w-10 h-10 text-[#ec1313] animate-pulse" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 uppercase">Module Loaded</h3>
      <p className="text-slate-400 max-w-sm mb-6 text-sm">
        The {title} module is initialized and ready for queries. Connect to the PKA291 Neural Network to begin.
      </p>
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <Input 
            placeholder={`Enter target for ${title}...`} 
            className="bg-black/50 border-[#ec1313]/30 text-white placeholder:text-slate-600 font-mono"
          />
          <Button className="bg-[#ec1313] hover:bg-[#c41111] text-white font-bold border border-[#ec1313]">
            EXECUTE
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

// --- Main Page Component ---

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/login');
        } else {
          toast.error('Failed to load profile');
        }
        return;
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { console.error(e); }
    localStorage.clear();
    router.push('/login');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ec1313] font-mono text-sm animate-pulse">INITIALIZING_PKA291...</div>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="border-b border-[#ec1313]/30 pb-6">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
              Welcome back, <span className="text-[#ec1313]">{user.username}</span>
            </h1>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
              SYSTEM_STATUS: <span className="text-green-500">ONLINE</span> // PKA291 <span className="text-[#ec1313]">2026</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/40 border border-[#ec1313]/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ec1313]/5 group-hover:bg-[#ec1313]/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Daily Searches</div>
                <div className="text-4xl font-black text-white mb-1">
                  {user.searchesUsed} <span className="text-lg text-slate-500">/ {user.searchesLimit}</span>
                </div>
                <div className="w-full h-1 bg-[#ec1313]/20 mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-[#ec1313] transition-all duration-1000" 
                    style={{ width: `${Math.min((user.searchesUsed / user.searchesLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="bg-black/40 border border-[#ec1313]/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ec1313]/5 group-hover:bg-[#ec1313]/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Current Plan</div>
                <div className="text-3xl font-black text-[#ec1313] uppercase mb-1">{user.planType}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">RENEWAL_PENDING</div>
              </div>
            </Card>

            <Card className="bg-black/40 border border-[#ec1313]/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ec1313]/5 group-hover:bg-[#ec1313]/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Network Status</div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-lg font-bold text-white">OPERATIONAL</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">LATENCY: 12ms</div>
              </div>
            </Card>
          </div>

          {/* Plans Section */}
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ec1313]" /> Available Upgrades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`bg-black/40 border p-6 relative group transition-all duration-300 ${
                    plan.highlighted ? 'border-[#ec1313] shadow-[0_0_15px_rgba(236,19,19,0.2)]' : 'border-[#ec1313]/20 hover:border-[#ec1313]/50'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0 bg-[#ec1313] text-black text-[10px] font-bold px-2 py-1 uppercase">
                      Recommended
                    </div>
                  )}
                  <div className="mb-4 text-[#ec1313]">{plan.icon}</div>
                  <h3 className="text-lg font-black text-white uppercase mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1 h-1 bg-[#ec1313]"></span> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full font-bold uppercase tracking-widest text-xs h-10 ${
                      plan.highlighted 
                        ? 'bg-[#ec1313] hover:bg-[#c41111] text-white' 
                        : 'bg-transparent border border-[#ec1313]/50 text-[#ec1313] hover:bg-[#ec1313]/10'
                    }`}
                  >
                    Select_Tier
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="border-b border-[#ec1313]/30 pb-6">
            <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Account Settings</h1>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
              MANAGE_CREDENTIALS // SECURITY_LEVEL_HIGH
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Profile Info */}
             <Card className="bg-black/40 border border-[#ec1313]/30 p-8 backdrop-blur-sm h-full">
                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#ec1313]" /> Profile Identity
                </h2>
                
                <div className="space-y-6">
                   <div>
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                       Username (Read Only)
                     </label>
                     <Input 
                        value={user.username} 
                        readOnly 
                        className="bg-black/50 border-[#ec1313]/20 text-white font-mono uppercase tracking-widest"
                     />
                   </div>

                   <div>
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                       Security Clearance
                     </label>
                     <div className="flex items-center gap-2 text-[#ec1313] font-bold uppercase tracking-widest border border-[#ec1313]/20 bg-[#ec1313]/5 p-3 rounded">
                        <Shield className="w-4 h-4" />
                        Level 1 Operator
                     </div>
                   </div>
                </div>
             </Card>

             {/* Change Password */}
             <Card className="bg-black/40 border border-[#ec1313]/30 p-8 backdrop-blur-sm h-full">
                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#ec1313]" /> Update Credentials
                </h2>
                
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                   <div>
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                       New Password
                     </label>
                     <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-black/50 border-[#ec1313]/20 text-white focus:border-[#ec1313]"
                        placeholder="Enter new password"
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                       Confirm Password
                     </label>
                     <Input 
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="bg-black/50 border-[#ec1313]/20 text-white focus:border-[#ec1313]"
                        placeholder="Confirm new password"
                     />
                   </div>
                   <Button 
                     type="submit" 
                     disabled={passwordLoading}
                     className="w-full bg-[#ec1313] hover:bg-[#c41111] text-white font-bold uppercase tracking-widest"
                   >
                     {passwordLoading ? 'Updating...' : 'Update_Password'}
                   </Button>
                </form>
             </Card>
          </div>

          {/* API Key Section */}
          <Card className="bg-black/40 border border-[#ec1313]/30 p-8 backdrop-blur-sm">
             <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
               <Terminal className="w-5 h-5 text-[#ec1313]" /> API Access
             </h2>
             <div className="space-y-6">
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-3">
                   Your API Key
                 </label>
                 <div className="bg-black border border-[#ec1313]/20 rounded p-4 relative group">
                   <div className="flex items-center gap-4">
                     <div className="flex-1 font-mono text-sm break-all text-[#ec1313] leading-relaxed">
                       {showApiKey ? user.apiKey : '•'.repeat(48)}
                     </div>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => setShowApiKey(!showApiKey)}
                       className="text-slate-400 hover:text-white hover:bg-[#ec1313]/10"
                     >
                       {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </Button>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => copyToClipboard(user.apiKey)}
                       className="text-slate-400 hover:text-white hover:bg-[#ec1313]/10"
                     >
                       <FileText className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
                 <p className="text-[10px] text-yellow-500/80 mt-2 flex items-center gap-1">
                   <AlertTriangle className="w-3 h-3" />
                   DO NOT SHARE THIS KEY. IT GRANTS FULL ACCESS TO YOUR ACCOUNT.
                 </p>
               </div>
             </div>
          </Card>
        </div>
      );
    }

    // Default: Tool Placeholder
    const category = categories.find(c => c.items.some(i => i.id === activeTab));
    const item = category?.items.find(i => i.id === activeTab);
    return <ToolPlaceholder title={item?.label || 'Unknown Module'} />;
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-[#ec1313] selection:text-white overflow-hidden flex">
      <div className="fixed inset-0 scanline-overlay z-50 pointer-events-none opacity-20"></div>

      {/* Sidebar */}
      <div className="w-72 bg-[#0a0a0a] border-r border-[#ec1313]/20 flex flex-col h-screen z-40 flex-shrink-0">
        <div className="p-6 border-b border-[#ec1313]/20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center border border-[#ec1313] relative bg-black group-hover:bg-[#ec1313] transition-colors duration-300">
              <span className="material-symbols-outlined text-[#ec1313] group-hover:text-black text-xl">star_rate</span>
            </div>
            <span className="text-xl font-black tracking-tigheerr text-white uppercase group-hover:text-[#ec1313] transition-colors">
              PKA291
            </span>
          </Link>
        </div>wdeswdes

        <div className="flex-1 overflow-y-auto terminal-scroll py-4 px-3 space-y-6">
          {categories.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-[10px] font-bold text-[#ec1313] uppercase tracking-widest mb-3 px-3 opacity-80">
                {cat.name}
              </h3>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-[#ec1313]/10 text-[#ec1313] border border-[#ec1313]/50 shadow-[0_0_10px_rgba(236,19,19,0.1)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#ec1313]/20 bg-black/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FireAvatar />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-widest">{user.username}</span>
                <span className="text-[10px] text-[#ec1313] font-mono tracking-widest">OP_LEVEL_1</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 text-slate-500 hover:text-[#ec1313] hover:bg-[#ec1313]/10 rounded transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-[#ec1313] hover:bg-[#ec1313]/10 rounded transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ec1313]/5 via-black to-black pointer-events-none"></div>
        <div className="max-w-6xl mx-auto p-8 relative z-10 min-h-full">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}
