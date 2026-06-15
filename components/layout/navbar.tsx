"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ShoppingCart,
  Sun,
  Moon,
  Menu,
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCartStore } from "@/store/cart-store"
import { cn } from "@/lib/utils"

// TODO: Replace with real auth state
type User = {
  name: string
  email: string
  avatar?: string
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/restaurants", label: "Restaurants" },
  { href: "/grocery", label: "Grocery" },
  { href: "/parcel", label: "Parcel" },
  { href: "/pickup", label: "Pickup" },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // TODO: Replace with real auth state
  const [user, setUser] = React.useState<User | null>(null)

  const itemCount = useCartStore(
    (state) => state.items.reduce((acc, item) => acc + item.quantity, 0)
  )

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("")

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            StudentExpress
          </span>
          <span className="text-xl font-extrabold tracking-tight text-[#FF6B00]">
            &nbsp;Georgia
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Cart */}
          <Link href="/cart" aria-label="Cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full"
                  variant="default"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User area */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-[#FF6B00] text-white text-xs font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                    <ClipboardList className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => setUser(null)}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className="hidden sm:inline-flex">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <span className="text-foreground font-extrabold">StudentExpress</span>
                  <span className="text-[#FF6B00] font-extrabold"> Georgia</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-4"
                  >
                    <Button className="w-full" variant="default">
                      Sign In
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
