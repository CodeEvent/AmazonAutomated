"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/account-actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-hairline-soft p-6">
      <h2 className="text-base font-semibold text-ink">Name and email</h2>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Name</span>
        <input
          type="text"
          name="name"
          defaultValue={name}
          required
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Email</span>
        <input
          type="email"
          name="email"
          defaultValue={email}
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
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
