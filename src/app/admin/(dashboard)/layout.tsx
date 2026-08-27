import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { adminLogoutAction } from "@/lib/actions/admin-auth-actions";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-surface-soft/40">
      <header className="flex items-center justify-between border-b border-hairline bg-ink px-4 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-canvas">Wayfarer Admin</span>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-canvas/80 hover:text-canvas">
              Dashboard
            </Link>
            <Link href="/admin/properties" className="text-sm font-medium text-canvas/80 hover:text-canvas">
              Properties
            </Link>
          </nav>
        </div>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="rounded-sm border border-canvas/30 px-3 py-1.5 text-sm font-medium text-canvas hover:bg-canvas/10"
          >
            Log out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
