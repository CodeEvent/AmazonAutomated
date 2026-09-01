"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";

type Action = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function BlockedDateForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-hairline bg-canvas p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Start date">
          <input name="startDate" type="date" required className={inputClass} />
        </Field>
        <Field label="End date">
          <input name="endDate" type="date" required className={inputClass} />
        </Field>
        <Field label="Reason (optional)">
          <input name="reason" placeholder="Maintenance, owner use..." className={inputClass} />
        </Field>
      </div>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Blocking..." : "Block these dates"}
      </button>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-sm border border-hairline px-3 text-sm text-ink focus:border-2 focus:border-ink focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
