import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      isActive: true, createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30",
    RESTAURANT_OWNER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
    DELIVERY_PARTNER: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
    CUSTOMER: "bg-muted text-muted-foreground",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm">{users.length} users total</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Name", "Email", "Phone", "Role", "Orders", "Status", "Joined"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${ROLE_COLORS[user.role]} border-0 text-xs`}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{user._count.orders}</td>
                  <td className="px-4 py-3">
                    <Badge className={user.isActive ? "bg-accent/10 text-accent border-0" : "bg-red-100 text-red-700 border-0"}>
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
