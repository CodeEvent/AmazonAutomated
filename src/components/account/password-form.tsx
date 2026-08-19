"use client";

import { useActionState, useRef, useEffect } from "react";
import { changePasswordAction } from "@/lib/actions/account-actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4 rounded-xl border border-hairline-soft p-6">
      <h2 className="text-base font-semibold text-ink">Change password</h2>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Current password</span>
        <input
          type="password"
          name="currentPassword"
          required
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">New password</span>
        <input
          type="password"
          name="newPassword"
          required
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Confirm new password</span>
        <input
          type="password"
          name="confirmPassword"
          required
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
