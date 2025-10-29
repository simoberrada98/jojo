"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const REVENUE_DATA = [
  { month: "Jan", revenue: 45.2, orders: 120 },
  { month: "Feb", revenue: 52.1, orders: 145 },
  { month: "Mar", revenue: 48.9, orders: 135 },
  { month: "Apr", revenue: 61.3, orders: 165 },
  { month: "May", revenue: 55.8, orders: 150 },
  { month: "Jun", revenue: 68.5, orders: 185 },
]

export default function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-foreground)" />
            <YAxis stroke="var(--color-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} name="Revenue (BTC)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Orders by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-foreground)" />
            <YAxis stroke="var(--color-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="orders" fill="var(--color-primary)" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
