import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { updateRoomTypeAction } from "@/lib/actions/admin-property-actions";

export default async function EditRoomTypePage({
  params,
}: {
  params: Promise<{ id: string; roomTypeId: string }>;
}) {
  const { id, roomTypeId } = await params;
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { property: { select: { id: true, name: true } } },
  });
  if (!roomType || roomType.propertyId !== id) notFound();

  const action = updateRoomTypeAction.bind(null, id, roomType.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">
          Edit {roomType.name} — {roomType.property.name}
        </h1>
        <Link
          href={`/admin/properties/${id}/room-types/${roomTypeId}/calendar`}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
        >
          Availability calendar
        </Link>
      </div>
      <div className="mt-6">
        <RoomTypeForm action={action} roomType={roomType} submitLabel="Save changes" />
      </div>
    </div>
  );
}
