import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const bookings = await prisma.booking.findMany({
    where: { messages: { some: {} } },
    include: {
      user: { select: { name: true, email: true } },
      property: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const threads = bookings
    .map((booking) => ({ booking, lastMessage: booking.messages[0] }))
    .sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">Messages</h1>
      <p className="mt-1 text-sm text-muted">
        Guest conversations about their bookings — admin replies stand in as the property&apos;s contact
        point.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-hairline bg-canvas">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="px-4 py-3 font-semibold">Guest</th>
              <th className="px-4 py-3 font-semibold">Property</th>
              <th className="px-4 py-3 font-semibold">Last message</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {threads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No conversations yet.
                </td>
              </tr>
            ) : (
              threads.map(({ booking, lastMessage }) => {
                const needsReply = lastMessage.sender === "GUEST";
                return (
                  <tr key={booking.id} className="border-b border-hairline-soft last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{booking.user.name}</p>
                      <p className="text-xs text-muted">{booking.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-body">{booking.property.name}</td>
                    <td className="max-w-[280px] px-4 py-3 text-body">
                      <p className="truncate">
                        {lastMessage.sender === "ADMIN" ? "You: " : ""}
                        {lastMessage.body}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          needsReply
                            ? "rounded-full bg-primary-disabled px-2 py-0.5 text-xs font-medium text-primary-error-text"
                            : "rounded-full bg-surface-soft px-2 py-0.5 text-xs font-medium text-muted"
                        }
                      >
                        {needsReply ? "Needs reply" : "Replied"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/messages/${booking.id}`} className="font-medium text-ink underline">
                        Open
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
