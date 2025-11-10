'use client';

import Link from 'next/link';
import { User, Settings, LogOut, Package, Heart } from 'lucide-react';
import { MotionButton } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Muted } from '@/components/ui/typography';
import { useAuth } from '@/lib/contexts/auth-context';
import { getInitials } from '@/lib/utils/string';
import { USER_DASHBOARD_NAV } from '@/lib/constants/navigation';
import { useAnimationConfig } from '@/lib/animation';

interface UserMenuProps {
  onAuthDialogOpen: () => void;
}

const iconMap = {
  User,
  Package,
  Heart,
  Settings,
};

export function UserMenu({ onAuthDialogOpen }: UserMenuProps) {
  const { user, profile, signOut } = useAuth();


  if (!user) {
    return (
      <MotionButton
        variant="ghost"
        size="icon"
        onClick={onAuthDialogOpen}
        className="rounded-full"
        aria-label="Open sign-in dialog"
      >
        <User className="w-5 h-5" />
      </MotionButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MotionButton
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Open user menu"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email)}
            </AvatarFallback>
          </Avatar>
        </MotionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <Muted className="m-0 font-medium text-foreground text-sm leading-none">
              {profile?.full_name || 'My Account'}
            </Muted>
            <Muted className="m-0 text-xs leading-none">{user.email}</Muted>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {USER_DASHBOARD_NAV.map((item) => {
          const Icon = item.icon
            ? iconMap[item.icon as keyof typeof iconMap]
            : User;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="cursor-pointer">
                <Icon className="mr-2 w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 w-4 h-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
