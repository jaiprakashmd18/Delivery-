"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, User, MapPin, Wallet,
  Heart, Bell, Share2, MessageSquare, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/wallet", label: "Wallet & Rewards", icon: Wallet },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/referral", label: "Referral", icon: Share2 },
  { href: "/support", label: "Support", icon: MessageSquare },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border hidden lg:flex flex-col">
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
