'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCart } from '@/lib/contexts/cart-context'; // Import useCart
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { H1, H2, H3, P } from '@/components/ui/typography';
import Wishlist from '@/components/dashboard/Wishlist'; // Import Wishlist component
import { ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const { items, total } = useCart(); // Get cart items and total
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const supabase = createClient();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
      })
      .eq('id', profile?.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      await refreshProfile();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <H1 className="font-bold text-3xl">Dashboard</H1>

      <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <P className="text-muted-foreground text-xs">
                  Email cannot be changed
                </P>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Cart Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cart</CardTitle>
            <CardDescription>
              Items currently in your shopping cart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-8 text-center">
                <ShoppingCart className="mb-4 w-16 h-16 text-muted-foreground" />
                <H3 className="mb-2 font-semibold text-2xl">
                  Your cart is empty
                </H3>
                <P className="max-w-md text-muted-foreground">
                  Add some products to your cart to see them here.
                </P>
                <Button asChild className="mt-6">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <P>
                  You have <strong>{items.length}</strong> items in your cart.
                </P>
                <P>
                  Total: <strong>${total.toFixed(2)} USD</strong>
                </P>
                <Button asChild className="w-full">
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wishlist */}
      <Wishlist />
    </div>
  );
}
