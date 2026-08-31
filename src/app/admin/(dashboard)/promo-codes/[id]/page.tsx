import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromoCodeForm } from "@/components/admin/promo-code-form";
import { updatePromoCodeAction, deletePromoCodeAction } from "@/lib/actions/admin-promo-actions";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditPromoCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promoCode = await prisma.promoCode.findUnique({ where: { id } });
  if (!promoCode) notFound();

  const action = updatePromoCodeAction.bind(null, promoCode.id);
  const deleteAction = deletePromoCodeAction.bind(null, promoCode.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">Edit {promoCode.code}</h1>
      <div className="mt-6">
        <PromoCodeForm action={action} promoCode={promoCode} submitLabel="Save changes" />
      </div>

      <div className="mt-8 rounded-lg border border-primary-error-text/30 bg-primary-disabled/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-error-text">Danger zone</h2>
        <p className="mt-2 text-sm text-body">
          Deleting a promo code doesn&apos;t affect past bookings that already used it, just future redemptions.
        </p>
        <div className="mt-3">
          <DeleteButton action={deleteAction} confirmMessage={`Delete "${promoCode.code}"?`} label="Delete code" />
        </div>
      </div>
    </div>
  );
}
