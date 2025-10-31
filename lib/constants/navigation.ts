/**
 * Navigation constants
 * Single source of truth for all navigation items
 */

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

/**
 * Main navigation items
 */
export const MAIN_NAV_ITEMS: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/collections/all",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "About Us",
    href: "/about",
  },
];

/**
 * User dashboard navigation items
 */
export const USER_DASHBOARD_NAV: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "User",
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: "Package",
  },
  {
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: "Heart",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
];

/**
 * Footer navigation sections
 */
export const FOOTER_NAV = {
  products: [
    { label: "Collections", href: "/collection" },
    { label: "ASIC Miners", href: "/collection" },
    { label: "GPU Rigs", href: "/collection" },
    { label: "Support", href: "/contact" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Returns Policy", href: "/returns" },
    { label: "Shipping Policy", href: "/shipping" },
  ],
} as const;

/**
 * Footer bottom links
 */
export const FOOTER_BOTTOM_LINKS: NavigationItem[] = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "Returns", href: "/returns" },
];

/**
 * App branding
 */
export const APP_BRANDING = {
  name: "Jhuangnyc",
  tagline: "Premium cryptocurrency mining hardware solutions.",
} as const;
