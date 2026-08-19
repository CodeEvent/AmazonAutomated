"use client";

import { useActionState, useRef, useEffect } from "react";
import { purchaseGiftCardAction } from "@/lib/actions/account-actions";

const AMOUNTS = [25, 50, 100, 200];

export function GiftCardForm() {
  const [state, formAction, pending] = useActionState(purchaseGiftCardAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-xl border border-hairline-soft p-6">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Amount (USD)</legend>
        <div className="flex flex-wrap gap-2">
          {AMOUNTS.map((amount, i) => (
            <label key={amount} className="cursor-pointer">
              <input
                type="radio"
                name="amount"
                value={amount}
                defaultChecked={i === 1}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas">
                ${amount}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Recipient name (optional)</span>
        <input
          type="text"
          name="recipientName"
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Recipient email (optional)</span>
        <input
          type="email"
          name="recipientEmail"
          className="h-12 w-full rounded-sm border border-hairline px-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Message (optional)</span>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-sm border border-hairline p-3 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-60"
      >
        {pending ? "Purchasing..." : "Purchase gift card"}
      </button>
      <p className="text-xs text-muted">This is a demo checkout — no real payment is processed.</p>
    </form>
  );
}
