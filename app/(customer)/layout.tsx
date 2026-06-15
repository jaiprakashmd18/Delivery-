import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import CustomerSidebar from './components/CustomerSidebar';
import CustomerHeader from './components/CustomerHeader';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      _count: {
        select: {
          notifications: {
            where: { isRead: false },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CustomerHeader user={user} unreadCount={user._count.notifications} />
      <div className="flex">
        <CustomerSidebar />
        <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pb-0 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
