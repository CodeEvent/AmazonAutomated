"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCoHostInquiryAction } from "@/lib/actions/account-actions";

export function CoHostForm() {
  const [state, formAction, pending] = useActionState(createCoHostInquiryAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-xl border border-hairline-soft p-6">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Which city is your place in?</span>
        <input
          type="text"
          name="city"
          required
          placeholder="e.g. Lisbon"
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Tell us what you need help with</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="e.g. I have a two-bedroom apartment and travel often — I need help with guest messaging and turnovers."
          className="w-full rounded-sm border border-hairline p-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
