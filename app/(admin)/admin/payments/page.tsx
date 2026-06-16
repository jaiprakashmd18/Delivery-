export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-accent/10 text-accent",
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30",
  REFUNDED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  COMPLETED: CheckCircle,
  PENDING: Clock,
  FAILED: XCircle,
  REFUNDED: CreditCard,
};

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: {
        select: {
          orderNumber: true,
          customer: { select: { name: true } },
        },
      },
    },
  });

  const totals = {
    completed: payments.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0),
    pending: payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0),
    refunded: payments.filter((p) => p.status === "REFUNDED").reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm">Track all platform transactions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-orange-600 rounded-xl p-5 text-white">
          <CreditCard className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-sm opacity-80">Collected Revenue</p>
          <p className="text-3xl font-bold">{formatPrice(totals.completed)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <Clock className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">{formatPrice(totals.pending)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <XCircle className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-xs text-muted-foreground">Refunded</p>
          <p className="text-2xl font-bold">{formatPrice(totals.refunded)}</p>
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Recent Payments ({payments.length})</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => {
                  const StatusIcon = STATUS_ICONS[payment.status] ?? CreditCard;
                  return (
                    <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">
                        {payment.order?.orderNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">{payment.order?.customer.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{payment.method}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(payment.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${STATUS_COLORS[payment.status] ?? "bg-muted"} border-0 text-xs flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(payment.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
