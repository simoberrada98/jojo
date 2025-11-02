'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';
import { H2, P } from './ui/typography';

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      amount: '2.5 BTC',
      status: 'Completed',
      date: '2025-01-15',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      amount: '1.8 BTC',
      status: 'Pending',
      date: '2025-01-14',
    },
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      email: 'bob@example.com',
      amount: '3.2 BTC',
      status: 'Completed',
      date: '2025-01-13',
    },
    {
      id: 'ORD-004',
      customer: 'Alice Brown',
      email: 'alice@example.com',
      amount: '0.8 BTC',
      status: 'Cancelled',
      date: '2025-01-12',
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <H2 className="font-bold text-foreground text-2xl">
          Orders Management
        </H2>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex sm:flex-row flex-col gap-4">
        <div className="relative flex-1">
          <Search className="top-3 left-3 absolute w-5 h-5 text-foreground/50" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card py-2 pr-4 pl-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full text-foreground placeholder-foreground/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-card px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
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
              <tr className="bg-background border-border border-b">
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Order ID
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Customer
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Amount
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Date
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-background border-border border-b transition"
                >
                  <td className="px-6 py-4 font-mono text-foreground">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <P className="font-medium text-foreground">
                        {order.customer}
                      </P>
                      <P className="text-foreground/60 text-xs">
                        {order.email}
                      </P>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-accent">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Completed'
                          ? 'bg-primary/20 text-primary'
                          : order.status === 'Pending'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground/70">{order.date}</td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent hover:bg-accent/10 border-accent text-accent"
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
  );
}
