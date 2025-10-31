"use client"
import { BarChart3, Package, ShoppingCart, Settings, LogOut, LayoutDashboard } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
}

const MENU_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function AdminSidebar({ activeTab, setActiveTab, isOpen }: AdminSidebarProps) {
  return (
    <aside
      className={`bg-card border-r border-border transition-all duration-300 ${isOpen ? "w-64" : "w-20"} flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">J</span>
        </div>
        {isOpen && <p className="text-sm font-semibold text-foreground mt-2">Jhuangnyc Admin</p>}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? "bg-primary/20 text-accent border border-accent"
                  : "text-foreground/70 hover:bg-background"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-background transition">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
