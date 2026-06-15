"use client";

import Link from "next/link";
import { Bell, Bike } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

interface Props {
  user: { name: string | null; email: string | null; image: string | null };
  unreadCount: number;
}

export default function CustomerHeader({ user, unreadCount }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Bike className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:inline text-sm">Student<span className="text-primary">Express</span></span>
      </Link>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/notifications" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center bg-primary text-white border-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
        <Link href="/dashboard/profile">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="text-xs bg-primary text-white">
              {getInitials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
