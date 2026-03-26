import { getAdminUser } from '@/lib/auth/admin-auth';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();

  // Not authenticated - show login page content
  if (!adminUser) {
    // If trying to access protected routes, redirect to login
    return (
      <main className="min-h-screen" style={{ background: 'var(--background)' }}>
        {children}
      </main>
    );
  }

  // Authenticated - show full admin layout
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r p-6" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="mb-8">
          <h1 className="text-xl font-serif">Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Personal Insight Engine
          </p>
        </div>
        <AdminNav />
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Logged in as
          </p>
          <p className="text-sm font-medium truncate">
            {adminUser.user.email}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8" style={{ background: 'var(--background)' }}>
        {children}
      </main>
    </div>
  );
}