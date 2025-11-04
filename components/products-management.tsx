'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { H2 } from './ui/typography';
import { Table } from './ui/table';
import { StatusBadge } from './ui/status-badge';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
}

export default function ProductsManagement() {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'ProMiner X1000',
      category: 'ASIC',
      price: '2.5 BTC',
      stock: 45,
      status: 'Active',
    },
    {
      id: 2,
      name: 'GPU Rig Pro',
      category: 'GPU',
      price: '1.8 BTC',
      stock: 28,
      status: 'Active',
    },
    {
      id: 3,
      name: 'UltraHash 5000',
      category: 'ASIC',
      price: '3.2 BTC',
      stock: 12,
      status: 'Active',
    },
    {
      id: 4,
      name: 'MiniMiner Compact',
      category: 'Compact',
      price: '0.8 BTC',
      stock: 0,
      status: 'Out of Stock',
    },
  ]);

  const columns = [
    { header: 'Product Name', accessor: 'name' as keyof Product },
    { header: 'Category', accessor: 'category' as keyof Product },
    { header: 'Price', accessor: 'price' as keyof Product },
    { header: 'Stock', accessor: 'stock' as keyof Product },
    {
      header: 'Status',
      accessor: 'status' as keyof Product,
      cell: (value: Product[keyof Product]) => (
        <StatusBadge status={value as string} />
      ),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Product,
      cell: (value: Product[keyof Product]) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-accent/10 text-accent"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-destructive/10 text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <H2 className="font-bold text-foreground text-2xl">
          Products Management
        </H2>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Table columns={columns} data={products} />
    </div>
  );
}
