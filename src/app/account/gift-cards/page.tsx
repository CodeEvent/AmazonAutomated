import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SettingsHeader } from "@/components/account/settings-header";
import { GiftCardForm } from "@/components/account/gift-card-form";

export default async function GiftCardsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/gift-cards");
  }

  const giftCards = await prisma.giftCard.findMany({
    where: { purchaserId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Gift cards" />

      <GiftCardForm />

      {giftCards.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-ink">Your gift cards</h2>
          <div className="mt-3 divide-y divide-hairline-soft border-y border-hairline-soft">
            {giftCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{card.code}</p>
                  {card.recipientName ? (
                    <p className="mt-1 text-sm text-muted">For {card.recipientName}</p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-ink">{formatPrice(card.balance)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
