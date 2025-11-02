'use client';

import { BrandLogo } from '@/components/brand-logo';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { P } from './ui/typography';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
}

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpen,
}: AdminSidebarProps) {
  return (
    <aside
      className={`bg-card border-r border-border transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-border border-b">
        <BrandLogo
          className="block w-10 text-foreground"
          title="Jhuangnyc Admin"
        />
        {isOpen && (
          <P className="mt-2 font-semibold text-foreground text-sm">
            Jhuangnyc Admin
          </P>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2 p-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-primary/20 text-accent border border-accent'
                  : 'text-foreground/70 hover:bg-background'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-border border-t">
        <button className="flex items-center gap-3 hover:bg-background px-4 py-3 rounded-lg w-full text-foreground/70 transition">
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
