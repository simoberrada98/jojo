/**
 * @deprecated This file is deprecated. Use components/header/Header.tsx instead
 * Kept for backward compatibility
 */

import { Header } from "./header/Header"

interface HeaderProps {
  cartCount?: number
}

export default function HeaderWrapper({ cartCount = 0 }: HeaderProps) {
  return <Header cartCount={cartCount} />
}
