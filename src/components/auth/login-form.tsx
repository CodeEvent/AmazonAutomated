"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth-actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Email</span>
        <input
          type="email"
          name="email"
          required
          className="h-14 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Password</span>
        <input
          type="password"
          name="password"
          required
          className="h-14 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-sm bg-primary text-base font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-xs text-muted">
        Demo account: demo@wayfarer.test / password123
      </p>
    </form>
  );
}
