export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Gift, Users, Copy, Share2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function ReferralPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      _count: { select: { referrals: true } },
    },
  });

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    select: { rewardPoints: true },
  });

  const referralCount = user?._count?.referrals ?? 0;
  const referralCode = user?.referralCode ?? "—";
  const pointsEarned = referralCount * 100;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Refer & Earn</h1>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 text-white">
        <Gift className="w-8 h-8 mb-3 opacity-80" />
        <h2 className="text-xl font-bold mb-1">Invite friends, earn rewards</h2>
        <p className="text-white/80 text-sm">
          Get 100 reward points for every friend who signs up and places their first order.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{referralCount}</p>
          <p className="text-xs text-muted-foreground">Friends Referred</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Gift className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{pointsEarned}</p>
          <p className="text-xs text-muted-foreground">Points Earned</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Share2 className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{formatPrice(pointsEarned * 0.01)}</p>
          <p className="text-xs text-muted-foreground">Value</p>
        </div>
      </div>

      {/* Referral code */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Your Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-widest text-primary">
            {referralCode}
          </div>
          <button className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors shrink-0">
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Share this code with friends. They get ₾2 off their first order and you earn 100 points.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold">How It Works</h3>
        {[
          { step: "1", title: "Share your code", desc: "Send your unique referral code to friends." },
          { step: "2", title: "Friend signs up", desc: "They create an account using your code." },
          { step: "3", title: "Friend orders", desc: "They place their first order and get ₾2 off." },
          { step: "4", title: "You earn", desc: "You receive 100 reward points (≈ ₾1)." },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
              {step}
            </div>
            <div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current points */}
      {wallet && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm font-medium">Your current reward points</p>
          <p className="font-bold text-primary">{wallet.rewardPoints.toLocaleString()} pts</p>
        </div>
      )}
    </div>
  );
}
