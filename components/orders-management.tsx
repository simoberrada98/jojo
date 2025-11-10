'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';
import { H2, P } from './ui/typography';
import { Table } from './ui/table';
import { StatusBadge } from './ui/status-badge';

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: string;
  date: string;
}

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const orders: Order[] = [
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

  const columns = [
    { header: 'Order ID', accessor: 'id' as keyof Order },
    {
      header: 'Customer',
      accessor: 'customer' as keyof Order,
      cell: (value: Order[keyof Order]) => (
        <div>
          <P className="font-medium text-foreground">{value as string}</P>
          <P className="text-foreground/60 text-xs">
            {orders.find((o) => o.customer === value)?.email}
          </P>
        </div>
      ),
    },
    { header: 'Amount', accessor: 'amount' as keyof Order },
    {
      header: 'Status',
      accessor: 'status' as keyof Order,
      cell: (value: Order[keyof Order]) => (
        <StatusBadge status={value as string} />
      ),
    },
    { header: 'Date', accessor: 'date' as keyof Order },
    {
      header: 'Action',
      accessor: 'id' as keyof Order,
      cell: (_value: Order[keyof Order]) => (
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent hover:bg-accent/10 border-accent text-accent"
        >
          View
        </Button>
      ),
    },
  ];

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
      <Table columns={columns} data={filteredOrders} />
    </div>
  );
}
