export function FAQSection({
  hasBreakfastOption,
  freeCancellationCount,
  totalRoomTypes,
  hasHouseRules,
}: {
  hasBreakfastOption: boolean;
  freeCancellationCount: number;
  totalRoomTypes: number;
  hasHouseRules: boolean;
}) {
  const cancellationAnswer =
    totalRoomTypes === 0
      ? "This property doesn't have any bookable room types yet."
      : freeCancellationCount === totalRoomTypes
        ? "Every room type at this property offers free cancellation before check-in."
        : freeCancellationCount === 0
          ? "Room types at this property are non-refundable once booked."
          : `${freeCancellationCount} of ${totalRoomTypes} room type${totalRoomTypes === 1 ? "" : "s"} offer free cancellation before check-in — the exact policy for your pick is shown before you book.`;

  const faqs = [
    {
      q: "Do I need to pay in advance?",
      a: "No prepayment is required to book. This is a demo platform, so no real payment is ever processed.",
    },
    {
      q: "What is the cancellation policy?",
      a: cancellationAnswer,
    },
    {
      q: "Is breakfast included?",
      a: hasBreakfastOption
        ? "Breakfast is available as a paid upgrade at checkout for eligible room types."
        : "This property doesn't currently offer a breakfast option.",
    },
    {
      q: "What time is check-in and check-out?",
      a: hasHouseRules
        ? "See House rules above for this property's check-in and check-out windows."
        : "This host hasn't listed specific check-in/check-out times yet — you can confirm details with them after booking.",
    },
    {
      q: "Can I bring pets?",
      a: "You can include pets in your guest count when booking; check with your host about any specific restrictions.",
    },
  ];

  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">Frequently asked questions</h2>
      <div className="mt-4 divide-y divide-hairline-soft border-y border-hairline-soft">
        {faqs.map((faq) => (
          <details key={faq.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-body">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
