"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { User, Package, Heart, Settings, LogOut, ShoppingBag } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r bg-card p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold">MineHub</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.full_name || profile?.email}
            </p>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Orders
              </Button>
            </Link>
            <Link href="/dashboard/wishlist">
              <Button variant="ghost" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Button>
            </Link>
            <Link href="/dashboard/cart">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Cart
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </nav>

          <div className="mt-auto pt-8">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
