"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin-sidebar";
import DashboardOverview from "@/components/dashboard-overview";
import OrdersManagement from "@/components/orders-management";
import ProductsManagement from "@/components/products-management";
import AnalyticsSection from "@/components/analytics-section";
import { Menu, X } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            <h1 className="font-bold text-foreground text-2xl">
              Admin Dashboard
            </h1>
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
            {activeTab === "overview" && <DashboardOverview />}
            {activeTab === "orders" && <OrdersManagement />}
            {activeTab === "products" && <ProductsManagement />}
            {activeTab === "analytics" && <AnalyticsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
