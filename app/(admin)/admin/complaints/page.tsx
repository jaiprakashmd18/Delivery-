export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  RESOLVED: "bg-accent/10 text-accent",
  CLOSED: "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  LOW: "bg-muted text-muted-foreground",
};

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle,
  CLOSED: CheckCircle,
};

export default async function AdminComplaintsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      messages: { select: { id: true } },
    },
  });

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Support & Complaints</h1>
        <p className="text-muted-foreground text-sm">Manage customer support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <AlertCircle className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.open}</p>
          <p className="text-xs text-muted-foreground">Open Tickets</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <Clock className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.inProgress}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <CheckCircle className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold">{stats.resolved}</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </div>
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No support tickets</h3>
          <p className="text-muted-foreground text-sm">Customer support requests will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {tickets.map((ticket) => {
            const StatusIcon = STATUS_ICONS[ticket.status] ?? AlertCircle;
            return (
              <div key={ticket.id} className="p-4 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-medium text-sm">{ticket.subject}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`${PRIORITY_COLORS[ticket.priority]} border-0 text-xs`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`${STATUS_COLORS[ticket.status]} border-0 text-xs`}>
                        {ticket.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.user.name} · {ticket.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDate(ticket.createdAt)} · {ticket.messages.length} message{ticket.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
