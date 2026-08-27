"use client";

import { useActionState } from "react";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";
import type { Property } from "@/generated/prisma/client";

type Action = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function PropertyForm({
  action,
  hosts,
  property,
  submitLabel,
}: {
  action: Action;
  hosts: Array<{ id: string; name: string }>;
  property?: Property;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Basics">
        <Field label="Slug (used in the URL)">
          <input
            name="slug"
            defaultValue={property?.slug}
            required
            placeholder="sunset-loft-lisbon"
            className={inputClass}
          />
        </Field>
        <Field label="Name">
          <input name="name" defaultValue={property?.name} required className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="type" defaultValue={property?.type ?? "APARTMENT"} className={inputClass}>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Host">
          <select name="hostId" defaultValue={property?.hostId} required className={inputClass}>
            <option value="">Choose a host</option>
            {hosts.map((host) => (
              <option key={host.id} value={host.id}>
                {host.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" full>
          <textarea
            name="description"
            defaultValue={property?.description}
            required
            rows={4}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Location">
        <Field label="City">
          <input name="city" defaultValue={property?.city} required className={inputClass} />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={property?.country} required className={inputClass} />
        </Field>
        <Field label="Address" full>
          <input name="address" defaultValue={property?.address} required className={inputClass} />
        </Field>
        <Field label="Latitude">
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={property?.latitude}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Longitude">
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={property?.longitude}
            required
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Capacity & pricing">
        <Field label="Price per night (USD)">
          <input
            name="pricePerNightDollars"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={property ? property.pricePerNight / 100 : undefined}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Max guests">
          <input
            name="maxGuests"
            type="number"
            min={1}
            defaultValue={property?.maxGuests}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Bedrooms">
          <input
            name="bedrooms"
            type="number"
            min={0}
            defaultValue={property?.bedrooms}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Beds">
          <input name="beds" type="number" min={0} defaultValue={property?.beds} required className={inputClass} />
        </Field>
        <Field label="Bathrooms">
          <input
            name="bathrooms"
            type="number"
            min={0}
            defaultValue={property?.bathrooms}
            required
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Amenities & photos">
        <Field label="Amenities (comma-separated)" full>
          <input
            name="amenities"
            defaultValue={property?.amenities.join(", ")}
            placeholder="Wifi, Kitchen, Air conditioning"
            className={inputClass}
          />
        </Field>
        <Field label="Unavailable amenities (comma-separated)" full>
          <input
            name="unavailableAmenities"
            defaultValue={property?.unavailableAmenities.join(", ")}
            placeholder="Pool, Elevator"
            className={inputClass}
          />
        </Field>
        <Field label="Image URLs (one per line)" full>
          <textarea
            name="images"
            defaultValue={property?.images.join("\n")}
            required
            rows={4}
            placeholder={"https://images.unsplash.com/...\nhttps://images.unsplash.com/..."}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Display stats">
        <Field label="Rating average (0-5)">
          <input
            name="ratingAverage"
            type="number"
            step="0.01"
            min={0}
            max={5}
            defaultValue={property?.ratingAverage ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Review count">
          <input
            name="reviewCount"
            type="number"
            min={0}
            defaultValue={property?.reviewCount ?? 0}
            className={inputClass}
          />
        </Field>
      </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
