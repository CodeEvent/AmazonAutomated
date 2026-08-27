import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { createRoomTypeAction } from "@/lib/actions/admin-property-actions";

export default async function NewRoomTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!property) notFound();

  const action = createRoomTypeAction.bind(null, property.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">New room type for {property.name}</h1>
      <div className="mt-6">
        <RoomTypeForm action={action} submitLabel="Create room type" />
      </div>
    </div>
  );
}
