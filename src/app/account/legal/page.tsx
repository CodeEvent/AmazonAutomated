import { SettingsHeader } from "@/components/account/settings-header";

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Legal" />

      <div className="space-y-8 text-sm leading-relaxed text-body">
        <section>
          <h2 className="text-base font-semibold text-ink">Terms of service</h2>
          <p className="mt-2">
            Wayfarer is a demonstration booking platform. Creating an account, browsing listings,
            and completing checkout are all part of a product demo — no real payments are
            processed, and no real reservations are honored by any third-party property.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">Privacy policy</h2>
          <p className="mt-2">
            Account information you provide (name, email, password) is stored to power this demo
            — login, bookings, and the account settings on this page. It is not sold or shared
            with third parties. You can update your marketing and profile visibility preferences
            any time under Privacy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">Cancellation policy</h2>
          <p className="mt-2">
            Each listing shows its own cancellation policy at checkout. Since no real payment is
            processed, cancellations in this demo are informational only.
          </p>
        </section>
      </div>
    </div>
  );
}
