"use client";

import { H3, Muted } from "@/components/ui/typography";
import { Users, Package, DollarSign } from "lucide-react";

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
];

import { ShoppingCart } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card p-6 border border-border rounded-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-primary text-sm">
                  {stat.change}
                </span>
              </div>
              <p className="mb-1 text-foreground/70 text-sm">{stat.label}</p>
              <p className="font-bold text-foreground text-2xl">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Recent Orders</H3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="px-4 py-3 font-semibold text-foreground/70 text-left">
                  Order ID
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-left">
                  Customer
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-left">
                  Amount
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-left">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-left">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "ORD-001",
                  customer: "John Doe",
                  amount: "2.5 BTC",
                  status: "Completed",
                  date: "2025-01-15",
                },
                {
                  id: "ORD-002",
                  customer: "Jane Smith",
                  amount: "1.8 BTC",
                  status: "Pending",
                  date: "2025-01-14",
                },
                {
                  id: "ORD-003",
                  customer: "Bob Johnson",
                  amount: "3.2 BTC",
                  status: "Completed",
                  date: "2025-01-13",
                },
              ].map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-background border-border border-b transition"
                >
                  <td className="px-4 py-3 font-mono text-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 font-semibold text-accent">
                    {order.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Completed"
                          ? "bg-primary/20 text-primary"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
