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
  Search,
  LogOut,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Zap,
  TrendingUp,
  AlertTriangle,
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserStats | null>(null);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [noResultsToday, setNoResultsToday] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.push('/login');
      return;
    }

    fetchUserStats();
  }, [router]);

  const fetchUserStats = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
        }
        return;
      }

      const data = await response.json();
      setUser(data);
      setNoResultsToday(data.searchesUsed >= data.searchesLimit);
    } catch (error) {
      console.error('[v0] Error fetching user stats:', error);
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
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
          <h1 className="text-xl font-bold text-primary">OSINT Platform</h1>
          <p className="text-xs text-muted-foreground mt-1">Intelligence Dashboard</p>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-semibold text-primary">Dashboard</p>
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
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Advanced OSINT Intelligence Gathering</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="lg:hidden border-border/50 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Warning if no searches left */}
        {noResultsToday && (
          <Card className="mb-6 p-4 bg-destructive/10 border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Daily Limit Reached</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have used your daily search allowance. Please upgrade your plan for more searches.
              </p>
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

        {/* Tabs */}
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList className="bg-secondary/50 border-border/50">
            <TabsTrigger value="results" className="data-[state=active]:bg-primary">
              Search Results
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {results.length === 0 ? (
              <Card className="p-12 text-center bg-card/50 border-border/50">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No search results yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the search above to begin your OSINT investigation
                </p>
              </Card>
            ) : (
              results.map((result) => (
                <Card
                  key={result.id}
                  className="p-6 bg-card/50 border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-foreground">{result.query}</p>
                      <p className="text-sm text-muted-foreground">{result.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <pre className="bg-input p-3 rounded text-xs text-foreground overflow-auto max-h-48">
                    {JSON.stringify(result.results, null, 2)}
                  </pre>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Account Settings</h3>

              <div className="space-y-6">
                {/* Telegram Code */}
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Telegram Connection Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={user.telegramCode}
                      disabled
                      className="bg-input border-border/50"
                    />
                    <Button
                      onClick={() => copyToClipboard(user.telegramCode)}
                      variant="outline"
                      className="border-border/50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use this code to connect your Telegram account
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={user.apiKey}
                      disabled
                      className="bg-input border-border/50"
                    />
                    <Button
                      onClick={() => copyToClipboard(user.apiKey)}
                      variant="outline"
                      className="border-border/50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Keep this key secure. Use it for API requests.
                  </p>
                </div>
              </div>
            </Card>

            {/* Upgrade Section */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Upgrade Your Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited searches and premium features
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  View Plans
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
