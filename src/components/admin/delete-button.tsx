"use client";

import { useState, useTransition } from "react";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Delete",
}: {
  action: () => Promise<AdminActionState>;
  confirmMessage: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="inline-block text-right">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-sm border border-primary-error-text/40 px-3 py-1.5 text-sm font-medium text-primary-error-text hover:bg-primary-disabled/40 disabled:opacity-60"
      >
        {pending ? "Deleting..." : label}
      </button>
      {error ? <p className="mt-1 text-xs text-primary-error-text">{error}</p> : null}
    </div>
  );
}
