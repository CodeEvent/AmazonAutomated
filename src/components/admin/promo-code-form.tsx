"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";
import type { PromoCode } from "@/generated/prisma/client";

type Action = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function PromoCodeForm({
  action,
  promoCode,
  submitLabel,
}: {
  action: Action;
  promoCode?: PromoCode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const discountValueDefault = promoCode
    ? promoCode.discountType === "PERCENT"
      ? promoCode.discountValue
      : promoCode.discountValue / 100
    : undefined;

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-hairline bg-canvas p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Code">
          <input
            name="code"
            defaultValue={promoCode?.code}
            required
            placeholder="WAYFARER10"
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Description (optional)">
          <input name="description" defaultValue={promoCode?.description ?? ""} className={inputClass} />
        </Field>
        <Field label="Discount type">
          <select name="discountType" defaultValue={promoCode?.discountType ?? "PERCENT"} className={inputClass}>
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount off (USD)</option>
          </select>
        </Field>
        <Field label="Discount value">
          <input
            name="discountValue"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={discountValueDefault}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Minimum nights (optional)">
          <input
            name="minNights"
            type="number"
            min={1}
            defaultValue={promoCode?.minNights ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Max redemptions (optional)">
          <input
            name="maxRedemptions"
            type="number"
            min={1}
            defaultValue={promoCode?.maxRedemptions ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Expires (optional)">
          <input
            name="expiresAt"
            type="date"
            defaultValue={promoCode?.expiresAt ? promoCode.expiresAt.toISOString().slice(0, 10) : ""}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={promoCode?.active ?? true}
            className="h-4 w-4"
          />
          <span className="text-sm text-ink">Active</span>
        </label>
      </div>

      {state?.error ? <p className="text-sm text-primary-error-text">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
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
