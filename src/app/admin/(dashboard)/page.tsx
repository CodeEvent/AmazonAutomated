import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [propertyCount, roomTypeCount, bookingCount, hostCount] = await Promise.all([
    prisma.property.count(),
    prisma.roomType.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.host.count(),
  ]);

  const stats = [
    { label: "Properties", value: propertyCount },
    { label: "Room types", value: roomTypeCount },
    { label: "Confirmed bookings", value: bookingCount },
    { label: "Hosts", value: hostCount },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-hairline bg-canvas p-4">
            <p className="text-2xl font-bold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/admin/properties"
          className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-active"
        >
          Manage properties
        </Link>
      </div>
    </div>
  );
}
