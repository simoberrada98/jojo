'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { P, H2 } from '@/components/ui/typography';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <P>Loading...</P>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="bg-card p-6 border-r w-64 min-h-screen">
          <div className="mb-8">
            <H2 className="font-bold text-xl">Jhuangnyc</H2>
            <P className="mt-1 text-muted-foreground text-sm">
              {profile?.full_name || profile?.email}
            </P>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="justify-start w-full">
                <User className="mr-2 w-4 h-4" />
                Profile
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="ghost" className="justify-start w-full">
                <Package className="mr-2 w-4 h-4" />
                Orders
              </Button>
            </Link>
            <Link href="/dashboard/wishlist">
              <Button variant="ghost" className="justify-start w-full">
                <Heart className="mr-2 w-4 h-4" />
                Wishlist
              </Button>
            </Link>
            <Link href="/dashboard/cart">
              <Button variant="ghost" className="justify-start w-full">
                <ShoppingBag className="mr-2 w-4 h-4" />
                Cart
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="justify-start w-full">
                <Settings className="mr-2 w-4 h-4" />
                Settings
              </Button>
            </Link>
          </nav>

          <div className="mt-auto pt-8">
            <Button
              variant="outline"
              className="justify-start w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
