import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function AdminPromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Promo codes</h1>
        <Link
          href="/admin/promo-codes/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-active"
        >
          + New code
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-hairline bg-canvas">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Discount</th>
              <th className="px-4 py-3 font-semibold">Min nights</th>
              <th className="px-4 py-3 font-semibold">Redemptions</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {promoCodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No promo codes yet.
                </td>
              </tr>
            ) : (
              promoCodes.map((promo) => {
                const expired = promo.expiresAt ? promo.expiresAt < new Date() : false;
                const maxedOut = promo.maxRedemptions != null && promo.redemptionCount >= promo.maxRedemptions;
                const status = !promo.active ? "Disabled" : expired ? "Expired" : maxedOut ? "Used up" : "Active";
                return (
                  <tr key={promo.id} className="border-b border-hairline-soft last:border-b-0">
                    <td className="px-4 py-3 font-medium text-ink">{promo.code}</td>
                    <td className="px-4 py-3 text-body">
                      {promo.discountType === "PERCENT"
                        ? `${promo.discountValue}% off`
                        : `${formatPrice(promo.discountValue)} off`}
                    </td>
                    <td className="px-4 py-3 text-body">{promo.minNights ?? "—"}</td>
                    <td className="px-4 py-3 text-body">
                      {promo.redemptionCount}
                      {promo.maxRedemptions != null ? ` / ${promo.maxRedemptions}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          status === "Active"
                            ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                            : "rounded-full bg-surface-soft px-2 py-0.5 text-xs font-medium text-muted"
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/promo-codes/${promo.id}`} className="font-medium text-ink underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
