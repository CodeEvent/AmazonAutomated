import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { PropertyForm } from "@/components/admin/property-form";
import { updatePropertyAction, deletePropertyAction, deleteRoomTypeAction } from "@/lib/actions/admin-property-actions";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [property, hosts] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: { roomTypes: { orderBy: { pricePerNight: "asc" } } },
    }),
    prisma.host.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!property) notFound();

  const updateAction = updatePropertyAction.bind(null, property.id);
  const deletePropertyBound = deletePropertyAction.bind(null, property.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Edit property</h1>
        <a
          href={`/property/${property.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-ink underline"
        >
          View live page
        </a>
      </div>

      <div className="mt-6">
        <PropertyForm action={updateAction} hosts={hosts} property={property} submitLabel="Save changes" />
      </div>

      <div className="mt-8 rounded-lg border border-hairline bg-canvas p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Room types</h2>
          <Link
            href={`/admin/properties/${property.id}/room-types/new`}
            className="text-sm font-semibold text-ink underline"
          >
            + Add room type
          </Link>
        </div>

        {property.roomTypes.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No room types yet — this property won&apos;t appear as bookable until you add one.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-hairline-soft">
            {property.roomTypes.map((roomType) => (
              <div key={roomType.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{roomType.name}</p>
                  <p className="text-sm text-muted">
                    {formatPrice(roomType.pricePerNight)}/night · {roomType.quantity} unit
                    {roomType.quantity === 1 ? "" : "s"} · sleeps {roomType.maxGuests}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/properties/${property.id}/room-types/${roomType.id}`}
                    className="text-sm font-medium text-ink underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteRoomTypeAction.bind(null, property.id, roomType.id)}
                    confirmMessage={`Delete "${roomType.name}"?`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-primary-error-text/30 bg-primary-disabled/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-error-text">Danger zone</h2>
        <p className="mt-2 text-sm text-body">
          Deleting a property also deletes its room types, bookings, and reviews. This can&apos;t be undone.
        </p>
        <div className="mt-3">
          <DeleteButton
            action={deletePropertyBound}
            confirmMessage={`Delete "${property.name}" and everything under it?`}
            label="Delete property"
          />
        </div>
      </div>
    </div>
  );
}
