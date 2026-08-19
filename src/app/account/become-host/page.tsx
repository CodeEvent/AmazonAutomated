import { SettingsHeader } from "@/components/account/settings-header";
import Link from "next/link";

export default function BecomeHostPage() {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Become a host" />

      <p className="text-base text-body">
        Listing management (creating a property, setting a price, managing your own calendar)
        isn&apos;t built in this demo yet — Wayfarer&apos;s listings are curated centrally for now.
      </p>
      <p className="mt-4 text-base text-body">
        If you already have a place and want help running it,{" "}
        <Link href="/account/co-host" className="font-semibold text-ink underline">
          find a co-host
        </Link>{" "}
        instead.
      </p>
    </div>
  );
}
