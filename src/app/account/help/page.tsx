import { SettingsHeader } from "@/components/account/settings-header";

const FAQS = [
  {
    q: "How do I cancel a booking?",
    a: "Go to My bookings, open the reservation, and check its cancellation policy — most Wayfarer stays are shown as refundable or non-refundable before you book.",
  },
  {
    q: "How does availability work?",
    a: "Once a stay is booked for a date range, those dates are blocked for every other guest automatically — no double-bookings.",
  },
  {
    q: "Is this a real payment platform?",
    a: "No — Wayfarer is a demo booking experience. Checkout, gift cards, and travel insurance are all mocked; no real payment is ever processed.",
  },
  {
    q: "How do I become a host?",
    a: "Tap \"Become a host\" from your profile. Full listing management isn't built yet in this demo, but we'd love to hear what you're working with.",
  },
  {
    q: "Who do I contact for support?",
    a: "This is a demo app without a live support team — but in a production version, this is where you'd reach us.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Get help" />

      <div className="divide-y divide-hairline-soft border-y border-hairline-soft">
        {FAQS.map((faq) => (
          <details key={faq.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-body">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
