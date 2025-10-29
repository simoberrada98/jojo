"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const orders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      email: "john@example.com",
      amount: "2.5 BTC",
      status: "Completed",
      date: "2025-01-15",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      email: "jane@example.com",
      amount: "1.8 BTC",
      status: "Pending",
      date: "2025-01-14",
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      email: "bob@example.com",
      amount: "3.2 BTC",
      status: "Completed",
      date: "2025-01-13",
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      email: "alice@example.com",
      amount: "0.8 BTC",
      status: "Cancelled",
      date: "2025-01-12",
    },
  ]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-foreground">Orders Management</h2>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/50" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Order ID</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Customer</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Amount</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Date</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-background transition">
                  <td className="py-4 px-6 text-foreground font-mono">{order.id}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-foreground font-medium">{order.customer}</p>
                      <p className="text-foreground/60 text-xs">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-accent font-semibold">{order.amount}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Completed"
                          ? "bg-primary/20 text-primary"
                          : order.status === "Pending"
                            ? "bg-accent/20 text-accent"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-foreground/70">{order.date}</td>
                  <td className="py-4 px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent/10 bg-transparent"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
