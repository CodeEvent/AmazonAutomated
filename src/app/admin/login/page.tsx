import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-[420px] px-4 py-16 sm:px-8">
      <h1 className="text-center text-[22px] font-medium text-ink">Wayfarer Admin</h1>
      <p className="mt-2 text-center text-sm text-muted">
        This is a separate login from regular guest accounts.
      </p>
      <div className="mt-8">
        <AdminLoginForm />
      </div>
    </div>
  );
}
