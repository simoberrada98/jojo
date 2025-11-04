'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { P, H2 } from '@/components/ui/typography';
import { useAuth } from '@/lib/contexts/auth-context';

type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

const navigationSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/dashboard',
        description: 'View and edit your personal details',
        icon: User,
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        description: 'Security, notifications, and preferences',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Shopping',
    items: [
      {
        label: 'Orders',
        href: '/dashboard/orders',
        description: 'Track current and past orders',
        icon: Package,
      },
      {
        label: 'Wishlist',
        href: '/dashboard/wishlist',
        description: 'Keep tabs on saved products',
        icon: Heart,
      },
      {
        label: 'Cart',
        href: '/dashboard/cart',
        description: 'Checkout pending items',
        icon: ShoppingBag,
      },
    ],
  },
];

function getInitials(fullName?: string | null, email?: string | null) {
  const fromName = fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (fromName) {
    return fromName;
  }

  const fromEmail = email?.slice(0, 2).toUpperCase();
  return fromEmail || 'U';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const displayName =
    profile?.full_name || profile?.email || user.email || 'User';
  const contactEmail = profile?.email || user.email || '';
  const initials = getInitials(profile?.full_name, contactEmail);

  const renderNavigation = (closeOnSelect = false) =>
    navigationSections.map((section) => (
      <div key={section.title} className="space-y-2">
        <P className="px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          {section.title}
        </P>
        <div className="space-y-1">
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            const content = (
              <>
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span className="flex flex-col text-sm">
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {item.description}
                  </span>
                </span>
              </>
            );

            if (closeOnSelect) {
              return (
                <SheetClose key={item.href} asChild>
                  <Button
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 px-3 py-3 w-full h-auto text-left"
                  >
                    <Link href={item.href}>{content}</Link>
                  </Button>
                </SheetClose>
              );
            }

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className="justify-start gap-3 px-3 py-3 w-full h-auto text-left"
              >
                <Link href={item.href}>{content}</Link>
              </Button>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="bg-muted/10 min-h-screen">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex flex-col bg-card/60 backdrop-blur border-r w-72">
          <div className="px-6 pt-10 pb-8 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="font-semibold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <H2 className="font-semibold text-lg">{displayName}</H2>
                {contactEmail ? (
                  <P className="text-muted-foreground text-xs">
                    {contactEmail}
                  </P>
                ) : null}
              </div>
            </div>
            <Badge variant="secondary" className="mt-4">
              Customer
            </Badge>
          </div>

          <nav className="flex flex-col flex-1 gap-6 px-3 py-6 overflow-y-auto">
            {renderNavigation()}
          </nav>

          <div className="px-6 py-6 border-t">
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

        <div className="flex flex-col flex-1">
          <header className="bg-background/95 supports-backdrop-filter:bg-background/70 backdrop-blur border-b">
            <div className="flex justify-between items-center px-4 sm:px-6 h-16">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-full max-w-xs">
                    <SheetHeader className="px-6 pt-10 pb-6">
                      <SheetTitle>Dashboard</SheetTitle>
                      <SheetDescription>
                        Quick access to your account tools.
                      </SheetDescription>
                    </SheetHeader>
                    <Separator />
                    <div className="space-y-6 px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="font-semibold text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <P className="font-medium">{displayName}</P>
                          {contactEmail ? (
                            <P className="text-muted-foreground text-xs">
                              {contactEmail}
                            </P>
                          ) : null}
                        </div>
                      </div>
                      <nav className="space-y-6">{renderNavigation(true)}</nav>
                    </div>
                    <div className="px-6 py-6 border-t">
                      <Button
                        variant="outline"
                        className="justify-start w-full"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <H2 className="font-semibold text-base">Dashboard</H2>
                  <P className="text-muted-foreground text-sm">
                    Manage your shopping activity and preferences.
                  </P>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <P className="font-medium text-foreground text-sm">
                    {displayName}
                  </P>
                  {contactEmail ? (
                    <P className="text-muted-foreground text-xs">
                      {contactEmail}
                    </P>
                  ) : null}
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Customer
                </Badge>
                <Avatar className="size-9">
                  <AvatarFallback className="font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
