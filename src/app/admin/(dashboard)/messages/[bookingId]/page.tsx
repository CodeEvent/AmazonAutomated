import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";
import { MessageThread } from "@/components/messages/message-thread";
import { sendAdminMessageAction } from "@/lib/actions/message-actions";

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      property: { select: { name: true, slug: true } },
      roomType: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking) notFound();

  const action = sendAdminMessageAction.bind(null, booking.id);

  return (
    <div>
      <Link href="/admin/messages" className="text-sm font-medium text-ink underline">
        &larr; Back to messages
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">
            {booking.user.name} — {booking.property.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {booking.user.email} · {booking.roomType.name} · {formatDateShort(booking.checkIn)} –{" "}
            {formatDateShort(booking.checkOut)}
          </p>
        </div>
        <Link
          href={`/property/${booking.property.slug}`}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
        >
          View listing
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-hairline bg-canvas p-5">
        <MessageThread
          messages={booking.messages}
          viewerRole="ADMIN"
          action={action}
          placeholder={`Reply to ${booking.user.name}…`}
        />
      </div>
    </div>
  );
}
