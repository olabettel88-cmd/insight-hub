'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  LogOut,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Zap,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Crown,
  Bitcoin,
  Loader2,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  query: string;
  type: string;
  results: unknown;
  timestamp: string;
}

interface UserStats {
  searchesUsed: number;
  searchesLimit: number;
  planType: string;
  telegramCode: string;
  apiKey: string;
}

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
    price: 100,
    period: '/ YEAR',
    duration: 'Billed yearly',
    searches: 500,
    features: [
      '500 searches/day',
      'Custom Indexing',
      '24/7 Support',
    ],
    highlighted: true,
    icon: <Crown className="w-6 h-6" />,
    buttonText: 'INITIALIZE_ELITE',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserStats | null>(null);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [noResultsToday, setNoResultsToday] = useState(false);
  const [activeTab, setActiveTab] = useState('results');

  // Payment State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/me', {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          toast.error('Failed to load user profile');
        }
        return;
      }

      const data = await response.json();
      
      // Ensure userId is in localStorage for other components/logic
      if (data.id) {
        localStorage.setItem('userId', data.id);
      }

      setUser(data);
      setNoResultsToday(data.searchesUsed >= data.searchesLimit);
    } catch (error) {
      console.error('[v0] Error fetching user stats:', error);
      toast.error('Failed to connect to server');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (noResultsToday) {
      toast.error('You have reached your daily search limit');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          type: searchType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Search failed');
        return;
      }

      const data = await response.json();
      setResults([data, ...results]);
      setQuery('');
      setNoResultsToday(true);
      toast.success('Search completed successfully');
      fetchUserStats();
    } catch (error) {
      console.error('[v0] Search error:', error);
      toast.error('An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers 
      });
    } catch (e) {
      console.error('Logout failed', e);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
    setPaymentData(null);
  };

  const handleCreatePayment = async () => {
    if (!selectedPlan) return;
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId: selectedPlan.id,
          cryptoCurrency,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
        toast.success('Payment invoice created');
      } else {
        toast.error('Failed to create payment');
      }
    } catch (error) {
      toast.error('Error creating payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar-like Navigation */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border p-6 hidden lg:flex flex-col">
        <div className="mb-12">
          <h1 className="text-xl font-bold text-primary">PKA291</h1>
          <p className="text-xs text-muted-foreground mt-1">Intelligence Dashboard</p>
        </div>

        <nav className="space-y-2 flex-1">
          <div 
            className={`p-3 rounded-lg border cursor-pointer ${activeTab === 'results' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-transparent hover:bg-muted'}`}
            onClick={() => setActiveTab('results')}
          >
            <p className="text-sm font-semibold flex items-center gap-2"><Search className="w-4 h-4"/> Dashboard</p>
          </div>
          <div 
            className={`p-3 rounded-lg border cursor-pointer ${activeTab === 'billing' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-transparent hover:bg-muted'}`}
            onClick={() => setActiveTab('billing')}
          >
             <p className="text-sm font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4"/> Billing</p>
          </div>
        </nav>

        <div className="space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">DAILY LIMIT</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{user.searchesUsed}/{user.searchesLimit}</span>
                <span className="text-muted-foreground">{user.planType}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(user.searchesUsed / user.searchesLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 border-border/50 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
               {activeTab === 'results' ? 'Dashboard' : 'Billing & Subscription'}
            </h2>
            <p className="text-muted-foreground">
               {activeTab === 'results' ? 'Advanced OSINT Intelligence Gathering' : 'Manage your plan and payment methods'}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="lg:hidden border-border/50 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {activeTab === 'results' && (
          <>
            {/* Warning if no searches left */}
            {noResultsToday && (
              <Card className="mb-6 p-4 bg-destructive/10 border-destructive/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Daily Limit Reached</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have used your daily search allowance. Please upgrade your plan for more searches.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab('billing')}>Upgrade Plan</Button>
                </div>
              </Card>
            )}

            {/* Search Section */}
            <Card className="mb-8 p-6 bg-card/50 backdrop-blur border-border/50">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Search Type
                  </label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Address</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="phone">Phone Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Query
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your search query..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={loading || noResultsToday}
                      className="bg-input border-border/50 flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={loading || noResultsToday}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                    >
                      {loading ? (
                        <div className="animate-spin">
                          <Zap className="w-4 h-4" />
                        </div>
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* Results Area */}
            <Tabs defaultValue="results" className="space-y-4">
              <TabsList className="bg-secondary/50 border-border/50">
                <TabsTrigger value="results" className="data-[state=active]:bg-primary">
                  Search Results
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-primary">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                {results.length === 0 ? (
                  <Card className="p-12 flex flex-col items-center justify-center text-center border-border/50 bg-card/30">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No searches yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      Enter a query above to start searching through our intelligence database.
                    </p>
                  </Card>
                ) : (
                  results.map((result, index) => (
                    <Card key={index} className="p-6 border-border/50 bg-card/30">
                       <div className="flex items-start justify-between">
                         <div>
                           <div className="flex items-center gap-2 mb-2">
                             <Badge variant="outline">{result.type}</Badge>
                             <span className="text-xs text-muted-foreground">{new Date(result.timestamp).toLocaleString()}</span>
                           </div>
                           <h4 className="font-mono text-lg">{result.query}</h4>
                         </div>
                         <Button variant="ghost" size="icon" onClick={() => copyToClipboard(JSON.stringify(result.results, null, 2))}>
                           <Copy className="w-4 h-4" />
                         </Button>
                       </div>
                       <div className="mt-4 p-4 rounded bg-black/50 overflow-x-auto">
                         <pre className="text-xs font-mono text-green-400">
                           {JSON.stringify(result.results, null, 2)}
                         </pre>
                       </div>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="settings">
                 <Card className="p-6 border-border/50 bg-card/30">
                    <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                    <div className="space-y-4">
                       <div>
                         <label className="text-sm font-medium">API Key</label>
                         <div className="flex gap-2 mt-1">
                           <Input value={user.apiKey || '................'} readOnly className="bg-black/50 font-mono" />
                           <Button variant="outline" size="icon" onClick={() => copyToClipboard(user.apiKey)}>
                             <Copy className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                    </div>
                 </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
             <Card className="p-6 border-border/50 bg-card/30">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-semibold">Current Plan</h3>
                   <Badge variant="outline" className="text-lg px-3 py-1">{user.planType}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="text-sm text-muted-foreground">Daily Searches</div>
                      <div className="text-2xl font-bold">{user.searchesLimit}</div>
                   </div>
                   <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="text-sm text-muted-foreground">Searches Used</div>
                      <div className="text-2xl font-bold">{user.searchesUsed}</div>
                   </div>
                   <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="text-sm text-muted-foreground">Usage</div>
                      <div className="text-2xl font-bold">{Math.round((user.searchesUsed / user.searchesLimit) * 100)}%</div>
                   </div>
                </div>
             </Card>

             <h3 className="text-xl font-bold mt-8 mb-4">Available Plans</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative p-6 flex flex-col ${plan.highlighted ? 'border-primary bg-primary/5' : 'border-border/50 bg-card/30'}`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold">
                        RECOMMENDED
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        {plan.icon}
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{plan.duration}</p>
                    </div>

                    <div className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      variant={plan.highlighted ? 'default' : 'outline'}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {user.planType === plan.id ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </Card>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Secure crypto payment via Heleket
            </DialogDescription>
          </DialogHeader>
          
          {!paymentData ? (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-zinc-800">
                <span className="text-zinc-400">Total Amount</span>
                <span className="text-2xl font-bold">${selectedPlan?.price}</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Cryptocurrency</label>
                <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                  <SelectTrigger className="bg-black border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
               <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                  {/* QR Code would be here, assuming the API returns an image URL or data */}
                  {paymentData.qrCode ? (
                    <img src={paymentData.qrCode} alt="Payment QR" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-black">QR Code</div>
                  )}
               </div>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs text-zinc-500 uppercase font-bold">Send Amount</label>
                   <div className="flex items-center gap-2 p-3 bg-black/40 rounded border border-zinc-800">
                     <span className="font-mono text-lg flex-1">{paymentData.amount} {paymentData.currency}</span>
                     <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(paymentData.amount)}>
                       <Copy className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs text-zinc-500 uppercase font-bold">To Address</label>
                   <div className="flex items-center gap-2 p-3 bg-black/40 rounded border border-zinc-800">
                     <span className="font-mono text-sm break-all flex-1">{paymentData.address}</span>
                     <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(paymentData.address)}>
                       <Copy className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
                 
                 <div className="text-center text-xs text-zinc-500">
                    Payment expires in {Math.floor((paymentData.expiresAt - Date.now()/1000)/60)} minutes
                 </div>
               </div>
            </div>
          )}

          <DialogFooter>
            {!paymentData ? (
              <Button className="w-full" onClick={handleCreatePayment} disabled={paymentLoading}>
                {paymentLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Proceed to Payment
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ className, variant, ...props }: any) {
  return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === 'outline' ? 'text-foreground' : 'bg-primary text-primary-foreground'} ${className}`} {...props} />
}
