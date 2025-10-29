"use client"

import { Users, Package, DollarSign } from "lucide-react"

const STATS = [
  {
    label: "Total Revenue",
    value: "125.5 BTC",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-accent",
  },
  {
    label: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    icon: ShoppingCart,
    color: "text-primary",
  },
  {
    label: "Active Products",
    value: "42",
    change: "+2",
    icon: Package,
    color: "text-secondary",
  },
  {
    label: "Total Customers",
    value: "856",
    change: "+15.3%",
    icon: Users,
    color: "text-accent",
  },
]

import { ShoppingCart } from "lucide-react"

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-primary">{stat.change}</span>
              </div>
              <p className="text-foreground/70 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Customer</th>
                <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "ORD-001", customer: "John Doe", amount: "2.5 BTC", status: "Completed", date: "2025-01-15" },
                { id: "ORD-002", customer: "Jane Smith", amount: "1.8 BTC", status: "Pending", date: "2025-01-14" },
                { id: "ORD-003", customer: "Bob Johnson", amount: "3.2 BTC", status: "Completed", date: "2025-01-13" },
              ].map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-background transition">
                  <td className="py-3 px-4 text-foreground font-mono">{order.id}</td>
                  <td className="py-3 px-4 text-foreground">{order.customer}</td>
                  <td className="py-3 px-4 text-accent font-semibold">{order.amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Completed" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground/70">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
