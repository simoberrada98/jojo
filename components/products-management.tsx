"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"

export default function ProductsManagement() {
  const [products] = useState([
    { id: 1, name: "ProMiner X1000", category: "ASIC", price: "2.5 BTC", stock: 45, status: "Active" },
    { id: 2, name: "GPU Rig Pro", category: "GPU", price: "1.8 BTC", stock: 28, status: "Active" },
    { id: 3, name: "UltraHash 5000", category: "ASIC", price: "3.2 BTC", stock: 12, status: "Active" },
    { id: 4, name: "MiniMiner Compact", category: "Compact", price: "0.8 BTC", stock: 0, status: "Out of Stock" },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-foreground">Products Management</h2>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Product Name</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Category</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Price</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Stock</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-foreground/70 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-background transition">
                  <td className="py-4 px-6 text-foreground font-medium">{product.name}</td>
                  <td className="py-4 px-6 text-foreground/70">{product.category}</td>
                  <td className="py-4 px-6 text-accent font-semibold">{product.price}</td>
                  <td className="py-4 px-6 text-foreground">{product.stock}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === "Active"
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/10">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
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
  )
}
