'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  LogOut,
  Settings,
  Users,
  Activity,
  Shield,
  Zap,
  Trash2,
  Lock,
  Edit2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiConfig {
  id: string;
  apiName: string;
  apiUrl: string;
  isActive: boolean;
  rateLimit: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSearches: number;
  suspiciousActivities: number;
  bannedUsers: number;
  revenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // New API form
  const [newApi, setNewApi] = useState({
    apiName: '',
    apiUrl: '',
    apiKey: '',
    rateLimit: 100,
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      fetchAdminData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (!response.ok) {
        toast.error('Invalid admin password');
        setAdminPassword('');
        return;
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      fetchAdminData();
    } catch (error) {
      toast.error('Authentication failed');
      console.error('[v0] Admin auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1');
        }
        return;
      }

      const data = await response.json();
      setStats(data.stats);
      setApiConfigs(data.apiConfigs);
    } catch (error) {
      console.error('[v0] Error fetching admin data:', error);
    }
  };

  const handleAddApi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newApi.apiName || !newApi.apiUrl) {
      toast.error('API name and URL are required');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/api-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newApi),
      });

      if (!response.ok) {
        toast.error('Failed to add API');
        return;
      }

      toast.success('API configuration added');
      setNewApi({ apiName: '', apiUrl: '', apiKey: '', rateLimit: 100 });
      fetchAdminData();
    } catch (error) {
      toast.error('An error occurred');
      console.error('[v0] Add API error:', error);
    }
  };

  const handleDeleteApi = async (apiId: string) => {
    if (!confirm('Are you sure you want to delete this API configuration?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/api-config/${apiId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Failed to delete API');
        return;
      }

      toast.success('API configuration deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('An error occurred');
      console.error('[v0] Delete API error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setShowPasswordPrompt(true);
    setAdminPassword('');
  };

  if (showPasswordPrompt && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background opacity-40" />

        <Card className="w-full max-w-md bg-card/80 backdrop-blur border-border/50 shadow-2xl relative z-10 p-8">
          <div className="mb-8 text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-2">Restricted Area</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Admin Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={loading}
                className="bg-input border-border/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !adminPassword}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border p-6 hidden lg:flex flex-col">
        <div className="mb-12">
          <Shield className="w-8 h-8 text-primary mb-2" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">System Administration</p>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-semibold text-primary">Dashboard</p>
          </div>
        </nav>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2 border-border/50 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
            <p className="text-muted-foreground">System Management & Monitoring</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="lg:hidden bg-transparent">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Total Searches</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalSearches}</p>
                </div>
                <Activity className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                  <p className="text-3xl font-bold text-primary">{stats.suspiciousActivities}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="api-config" className="space-y-4">
          <TabsList className="bg-secondary/50 border-border/50">
            <TabsTrigger value="api-config" className="data-[state=active]:bg-primary">
              <Settings className="w-4 h-4 mr-2" />
              API Configuration
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary">
              <Activity className="w-4 h-4 mr-2" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* API Config Tab */}
          <TabsContent value="api-config" className="space-y-4">
            {/* Add New API */}
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add New API Configuration
              </h3>

              <form onSubmit={handleAddApi} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      API Name
                    </label>
                    <Input
                      placeholder="e.g., breach.rip"
                      value={newApi.apiName}
                      onChange={(e) => setNewApi({ ...newApi, apiName: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Rate Limit
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newApi.rateLimit}
                      onChange={(e) =>
                        setNewApi({ ...newApi, rateLimit: parseInt(e.target.value) })
                      }
                      className="bg-input border-border/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    API URL
                  </label>
                  <Input
                    placeholder="https://api.example.com"
                    value={newApi.apiUrl}
                    onChange={(e) => setNewApi({ ...newApi, apiUrl: e.target.value })}
                    className="bg-input border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="API Key"
                    value={newApi.apiKey}
                    onChange={(e) => setNewApi({ ...newApi, apiKey: e.target.value })}
                    className="bg-input border-border/50"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Add API Configuration
                </Button>
              </form>
            </Card>

            {/* Existing APIs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Active API Configurations</h3>
              {apiConfigs.map((api) => (
                <Card key={api.id} className="p-4 bg-card/50 border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{api.apiName}</p>
                      <p className="text-sm text-muted-foreground">{api.apiUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border/50 bg-transparent"
                        disabled
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteApi(api.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rate Limit: {api.rateLimit}</span>
                    <span className={api.isActive ? 'text-green-500' : 'text-muted-foreground'}>
                      {api.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6 bg-card/50 border-border/50">
              <p className="text-muted-foreground">User management interface coming soon...</p>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="p-6 bg-card/50 border-border/50">
              <p className="text-muted-foreground">Activity logs and monitoring coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
