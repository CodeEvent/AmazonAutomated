"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth-actions";

export function SignupForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(registerAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} suppressHydrationWarning />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Full name</span>
        <input
          type="text"
          name="name"
          required
          suppressHydrationWarning
          className="h-14 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Email</span>
        <input
          type="email"
          name="email"
          required
          suppressHydrationWarning
          className="h-14 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          suppressHydrationWarning
          className="h-14 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-sm bg-primary text-base font-medium text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
