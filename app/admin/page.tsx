"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin-sidebar"
import DashboardOverview from "@/components/dashboard-overview"
import OrdersManagement from "@/components/orders-management"
import ProductsManagement from "@/components/products-management"
import AnalyticsSection from "@/components/analytics-section"
import { Menu, X } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-background transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-accent">AD</span>
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
  )
}
