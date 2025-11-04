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
      <div className="flex min-h-screen items-center justify-center">
        <P>Loading...</P>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const displayName = profile?.full_name || profile?.email || user.email || 'User';
  const contactEmail = profile?.email || user.email || '';
  const initials = getInitials(profile?.full_name, contactEmail);

  const renderNavigation = (closeOnSelect = false) =>
    navigationSections.map((section) => (
      <div key={section.title} className="space-y-2">
        <P className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {section.title}
        </P>
        <div className="space-y-1">
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            const content = (
              <>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex flex-col text-sm">
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
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
                    className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
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
                className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
              >
                <Link href={item.href}>{content}</Link>
              </Button>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r bg-card/60 backdrop-blur lg:flex">
          <div className="border-b px-6 pb-8 pt-10">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="text-base font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <H2 className="text-lg font-semibold">{displayName}</H2>
                {contactEmail ? (
                  <P className="text-xs text-muted-foreground">
                    {contactEmail}
                  </P>
                ) : null}
              </div>
            </div>
            <Badge variant="secondary" className="mt-4">
              Customer
            </Badge>
          </div>

          <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6">
            {renderNavigation()}
          </nav>

          <div className="border-t px-6 py-6">
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

        <div className="flex flex-1 flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
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
                  <SheetContent side="left" className="w-full max-w-xs p-0">
                    <SheetHeader className="px-6 pt-10 pb-6">
                      <SheetTitle>Dashboard</SheetTitle>
                      <SheetDescription>
                        Quick access to your account tools.
                      </SheetDescription>
                    </SheetHeader>
                    <Separator />
                    <div className="px-6 py-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="text-sm font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <P className="font-medium">{displayName}</P>
                          {contactEmail ? (
                            <P className="text-xs text-muted-foreground">
                              {contactEmail}
                            </P>
                          ) : null}
                        </div>
                      </div>
                      <nav className="space-y-6">{renderNavigation(true)}</nav>
                    </div>
                    <div className="border-t px-6 py-6">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <H2 className="text-base font-semibold">Dashboard</H2>
                  <P className="text-sm text-muted-foreground">
                    Manage your shopping activity and preferences.
                  </P>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <P className="text-sm font-medium text-foreground">
                    {displayName}
                  </P>
                  {contactEmail ? (
                    <P className="text-xs text-muted-foreground">
                      {contactEmail}
                    </P>
                  ) : null}
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Customer
                </Badge>
                <Avatar className="size-9">
                  <AvatarFallback className="text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
