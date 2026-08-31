import { PromoCodeForm } from "@/components/admin/promo-code-form";
import { createPromoCodeAction } from "@/lib/actions/admin-promo-actions";

export default function NewPromoCodePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-ink">New promo code</h1>
      <div className="mt-6">
        <PromoCodeForm action={createPromoCodeAction} submitLabel="Create code" />
      </div>
    </div>
  );
}
