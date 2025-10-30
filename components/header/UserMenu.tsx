"use client"

import Link from "next/link"
import { User, Settings, LogOut, Package, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Muted } from "@/components/ui/typography"
import { useAuth } from "@/lib/contexts/auth-context"
import { getInitials } from "@/lib/utils/string"
import { USER_DASHBOARD_NAV } from "@/lib/constants/navigation"

interface UserMenuProps {
  onAuthDialogOpen: () => void
}

const iconMap = {
  User,
  Package,
  Heart,
  Settings,
}

export function UserMenu({ onAuthDialogOpen }: UserMenuProps) {
  const { user, profile, signOut } = useAuth()

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onAuthDialogOpen}
        className="rounded-full"
      >
        <User className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <Muted className="text-sm font-medium leading-none m-0 text-foreground">
              {profile?.full_name || "My Account"}
            </Muted>
            <Muted className="text-xs leading-none m-0">{user.email}</Muted>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {USER_DASHBOARD_NAV.map((item) => {
          const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : User
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="cursor-pointer">
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
