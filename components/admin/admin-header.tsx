"use client";
import { Bell, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Admin Dashboard</h2>
          <p className="text-xs text-gray-400">StudentExpress Georgia</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">3</span>
              </div>
              {[
                { title: "New restaurant pending approval", time: "2 min ago", type: "restaurant" },
                { title: "5 orders pending for 30+ min", time: "15 min ago", type: "order" },
                { title: "New delivery partner application", time: "1 hr ago", type: "partner" },
              ].map((n, i) => (
                <div key={i} className="p-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{n.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
                </div>
              ))}
              <div className="p-2 text-center">
                <button className="text-sm text-orange-500 hover:underline">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0] ?? "A"}
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user?.name ?? "Admin"}</div>
            <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
