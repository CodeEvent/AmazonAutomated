"use client";

import { useActionState } from "react";
import { updatePrivacyAction } from "@/lib/actions/account-actions";

export function PrivacyForm({
  marketingOptIn,
  searchableProfile,
}: {
  marketingOptIn: boolean;
  searchableProfile: boolean;
}) {
  const [state, formAction, pending] = useActionState(updatePrivacyAction, null);

  return (
    <form action={formAction} className="space-y-1 divide-y divide-hairline-soft rounded-xl border border-hairline-soft">
      <Toggle
        name="marketingOptIn"
        defaultChecked={marketingOptIn}
        title="Marketing emails"
        description="Get trip inspiration, deals, and product updates from Wayfarer."
      />
      <Toggle
        name="searchableProfile"
        defaultChecked={searchableProfile}
        title="Searchable profile"
        description="Let hosts and other guests find your public profile."
      />

      <div className="p-6">
        {state?.error ? <p className="mb-3 text-sm text-primary-error-text">{state.error}</p> : null}
        {state?.success ? <p className="mb-3 text-sm text-green-700">{state.success}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </form>
  );
}

function Toggle({
  name,
  defaultChecked,
  title,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 p-6">
      <span>
        <span className="block text-base font-medium text-ink">{title}</span>
        <span className="mt-1 block text-sm text-muted">{description}</span>
      </span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 shrink-0 accent-ink"
      />
    </label>
  );
}
