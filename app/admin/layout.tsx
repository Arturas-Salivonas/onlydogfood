import { getAdminUser } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Dashboard - OnlyDogFood.com',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Middleware handles auth, this layout just provides structure
  const user = await getAdminUser();

  // If no user, show children (login page)
  if (!user) {
    return <>{children}</>;
  }

  // If user exists, show admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}



