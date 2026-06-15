export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Wallet, TrendingUp, TrendingDown, Star, Gift } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  const balance = wallet?.balance ?? 0;
  const rewardPoints = wallet?.rewardPoints ?? 0;
  const cashbackEarned = wallet?.cashbackEarned ?? 0;
  const transactions = wallet?.transactions ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Wallet & Rewards</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-5 text-white col-span-1 sm:col-span-1">
          <Wallet className="w-6 h-6 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Wallet Balance</p>
          <p className="text-3xl font-bold">{formatPrice(balance)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <Star className="w-6 h-6 mb-3 text-yellow-500" />
          <p className="text-xs text-muted-foreground">Reward Points</p>
          <p className="text-2xl font-bold">{rewardPoints.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">≈ {formatPrice(rewardPoints * 0.01)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <Gift className="w-6 h-6 mb-3 text-accent" />
          <p className="text-xs text-muted-foreground">Total Cashback</p>
          <p className="text-2xl font-bold text-accent">{formatPrice(cashbackEarned)}</p>
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <h3 className="font-semibold mb-3 text-primary">How to Earn Rewards</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>🎯 Earn 10 points for every ₾1 spent on orders</p>
          <p>🎁 Get 100 bonus points for referring a friend</p>
          <p>⭐ 5% cashback on your first 3 orders each month</p>
          <p>🏆 Redeem 100 points = ₾1 off your next order</p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="font-semibold mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === "credit"
                    ? "bg-accent/10 text-accent"
                    : "bg-red-100 text-red-500 dark:bg-red-900/20"
                }`}>
                  {tx.type === "credit"
                    ? <TrendingUp className="w-4 h-4" />
                    : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`font-bold text-sm shrink-0 ${
                  tx.type === "credit" ? "text-accent" : "text-red-500"
                }`}>
                  {tx.type === "credit" ? "+" : "−"}{formatPrice(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
