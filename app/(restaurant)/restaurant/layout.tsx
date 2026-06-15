import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, BarChart2, Star, Settings, UtensilsCrossed as Logo } from "lucide-react";

const NAV_ITEMS = [
  { href: "/restaurant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/restaurant/orders", label: "Orders", icon: ClipboardList },
  { href: "/restaurant/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/restaurant/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/restaurant/reviews", label: "Reviews", icon: Star },
  { href: "/restaurant/settings", label: "Settings", icon: Settings },
];

export default async function RestaurantOwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session || (role !== "RESTAURANT_OWNER" && role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Logo className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm">Restaurant <span className="text-primary">Dashboard</span></span>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border hidden lg:flex flex-col">
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 p-6 min-h-screen pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex">
        {NAV_ITEMS.slice(0, 4).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-3 text-muted-foreground hover:text-primary transition-colors">
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
