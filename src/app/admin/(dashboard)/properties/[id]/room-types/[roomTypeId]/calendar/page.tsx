import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { buildCalendarMonth, leadingOffset } from "@/lib/admin-calendar";
import { formatDateShort } from "@/lib/format";
import { AvailabilityMonthGrid } from "@/components/admin/availability-month-grid";
import { BlockedDateForm } from "@/components/admin/blocked-date-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { createBlockedDateAction, deleteBlockedDateAction } from "@/lib/actions/admin-availability-actions";

export default async function RoomTypeCalendarPage({
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

  const [bookings, blockedDates] = await Promise.all([
    prisma.booking.findMany({
      where: { roomTypeId, status: "CONFIRMED" },
      select: { checkIn: true, checkOut: true },
    }),
    prisma.blockedDate.findMany({
      where: { roomTypeId },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const now = new Date();
  const months = [0, 1].map((offset) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    return {
      label: format(monthDate, "MMMM yyyy"),
      days: buildCalendarMonth(year, month, roomType.quantity, bookings, blockedDates),
      leadingOffset: leadingOffset(year, month),
    };
  });

  const createAction = createBlockedDateAction.bind(null, id, roomTypeId);

  return (
    <div>
      <Link href={`/admin/properties/${id}/room-types/${roomTypeId}`} className="text-sm font-medium text-ink underline">
        &larr; Back to {roomType.name}
      </Link>
      <h1 className="mt-2 text-xl font-bold text-ink">
        Availability calendar — {roomType.name} — {roomType.property.name}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {roomType.quantity} unit{roomType.quantity === 1 ? "" : "s"} total. Real confirmed bookings and blocked
        ranges both reduce what guests can book — this isn&apos;t decorative.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <LegendSwatch className="bg-surface-soft" label="Available" />
        <LegendSwatch className="bg-primary-disabled" label="Fully booked" />
        <LegendSwatch className="bg-ink/10" label="Blocked" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {months.map((month) => (
          <AvailabilityMonthGrid key={month.label} monthLabel={month.label} days={month.days} leadingOffset={month.leadingOffset} />
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold text-ink">Block dates</h2>
      <div className="mt-3">
        <BlockedDateForm action={createAction} />
      </div>

      <h2 className="mt-8 text-lg font-bold text-ink">Blocked ranges</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-hairline bg-canvas">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="px-4 py-3 font-semibold">Dates</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {blockedDates.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No blocked dates yet.
                </td>
              </tr>
            ) : (
              blockedDates.map((blocked) => {
                const deleteAction = deleteBlockedDateAction.bind(null, id, roomTypeId, blocked.id);
                return (
                  <tr key={blocked.id} className="border-b border-hairline-soft last:border-b-0">
                    <td className="px-4 py-3 text-ink">
                      {formatDateShort(blocked.startDate)} – {formatDateShort(blocked.endDate)}
                    </td>
                    <td className="px-4 py-3 text-body">{blocked.reason || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteButton
                        action={deleteAction}
                        confirmMessage="Unblock these dates?"
                        label="Unblock"
                      />
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

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
