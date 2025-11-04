'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context'; // Import useAuth
import AdminSidebar from '@/components/admin-sidebar';
import DashboardOverview from '@/components/dashboard-overview';
import OrdersManagement from '@/components/orders-management';
import ProductsManagement from '@/components/products-management';
import AnalyticsSection from '@/components/analytics-section';
import { Menu, X } from 'lucide-react';
import { H1, P } from '@/components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth(); // Get user, profile, and authLoading
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/'); // Redirect to homepage if not authenticated or not admin
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || !user || profile?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center bg-background p-4 min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <P className="text-muted-foreground">
              You do not have permission to access this page.
            </P>
            <Button onClick={() => router.push('/')}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex bg-background h-screen">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center bg-card px-6 py-4 border-border border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-background p-2 rounded-lg transition"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <H1 className="font-bold text-foreground text-2xl">
              Admin Dashboard
            </H1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center bg-primary/20 rounded-full w-10 h-10">
              <span className="font-semibold text-accent text-sm">AD</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'orders' && <OrdersManagement />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'analytics' && <AnalyticsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
