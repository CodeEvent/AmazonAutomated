"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";
import type { RoomType } from "@/generated/prisma/client";

type Action = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function RoomTypeForm({
  action,
  roomType,
  submitLabel,
}: {
  action: Action;
  roomType?: RoomType;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-hairline bg-canvas p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" defaultValue={roomType?.name} required className={inputClass} />
        </Field>
        <Field label="Bed configuration">
          <input
            name="bedConfiguration"
            defaultValue={roomType?.bedConfiguration}
            required
            placeholder="1 king bed, 1 sofa bed"
            className={inputClass}
          />
        </Field>
        <Field label="Max guests">
          <input
            name="maxGuests"
            type="number"
            min={1}
            defaultValue={roomType?.maxGuests}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Size (m², optional)">
          <input name="sizeSqm" type="number" min={1} defaultValue={roomType?.sizeSqm ?? ""} className={inputClass} />
        </Field>
        <Field label="Price per night (USD)">
          <input
            name="pricePerNightDollars"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={roomType ? roomType.pricePerNight / 100 : undefined}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Quantity available">
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={roomType?.quantity ?? 1}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Amenities (comma-separated)" full>
          <input
            name="amenities"
            defaultValue={roomType?.amenities.join(", ")}
            placeholder="City view, Air conditioning, Free WiFi"
            className={inputClass}
          />
        </Field>
        <Field label="Image URLs (one per line, optional)" full>
          <textarea
            name="images"
            defaultValue={roomType?.images.join("\n")}
            rows={3}
            className={inputClass}
          />
        </Field>
        <Field label="Description (optional)" full>
          <textarea name="description" defaultValue={roomType?.description ?? ""} rows={3} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            name="freeCancellation"
            value="true"
            defaultChecked={roomType?.freeCancellation ?? true}
            className="h-4 w-4"
          />
          <span className="text-sm text-ink">Free cancellation</span>
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

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
