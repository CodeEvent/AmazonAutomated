import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/property-form";
import { createPropertyAction } from "@/lib/actions/admin-property-actions";

export default async function NewPropertyPage() {
  const hosts = await prisma.host.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">New property</h1>
      <p className="mt-1 text-sm text-muted">
        After creating the property, add at least one room type so it shows up as bookable.
      </p>
      <div className="mt-6">
        <PropertyForm action={createPropertyAction} hosts={hosts} submitLabel="Create property" />
      </div>
    </div>
  );
}
