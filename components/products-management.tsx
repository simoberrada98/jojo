'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { H2 } from './ui/typography';

export default function ProductsManagement() {
  const [products] = useState([
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
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background border-border border-b">
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Product Name
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Category
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Price
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Stock
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-background border-border border-b transition"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-foreground/70">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 font-semibold text-accent">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 text-foreground">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'Active'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="flex gap-2 px-6 py-4">
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
