import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getReportingSummary } from "@/lib/admin-reports";

export default async function AdminDashboardPage() {
  const [propertyCount, roomTypeCount, bookingCount, hostCount, report] = await Promise.all([
    prisma.property.count(),
    prisma.roomType.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.host.count(),
    getReportingSummary(),
  ]);

  const stats = [
    { label: "Properties", value: propertyCount },
    { label: "Room types", value: roomTypeCount },
    { label: "Confirmed bookings", value: bookingCount },
    { label: "Hosts", value: hostCount },
  ];

  const revenueTrend =
    report.priorWindowRevenueCents > 0
      ? Math.round(
          ((report.windowRevenueCents - report.priorWindowRevenueCents) / report.priorWindowRevenueCents) * 100,
        )
      : null;

  const maxDailyBookings = Math.max(1, ...report.dailyBookings.map((d) => d.count));

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

      <h2 className="mt-10 text-lg font-bold text-ink">Reporting</h2>
      <p className="mt-1 text-sm text-muted">
        Revenue and occupancy computed from confirmed bookings, last {report.dailyBookings.length} days
        unless noted.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ReportTile label="Total revenue" value={formatPrice(report.totalRevenueCents)} />
        <ReportTile
          label="Revenue (30d)"
          value={formatPrice(report.windowRevenueCents)}
          trend={revenueTrend}
        />
        <ReportTile label="Avg. booking value" value={formatPrice(report.averageBookingValueCents)} />
        <ReportTile label="Occupancy, next 30d" value={`${report.forwardOccupancyRatePercent}%`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ReportTile label="Occupancy, past 30d" value={`${report.trailingOccupancyRatePercent}%`} />
        <ReportTile label="Cancellation rate" value={`${report.cancellationRatePercent}%`} />
        <ReportTile label="Cancelled bookings" value={String(report.cancelledBookings)} />
        <ReportTile label="Total bookings" value={String(report.totalBookings)} />
      </div>

      <div className="mt-6 rounded-lg border border-hairline bg-canvas p-5">
        <h3 className="text-sm font-semibold text-ink">Bookings per day (last {report.dailyBookings.length} days)</h3>
        <div className="mt-4 flex h-24 items-end gap-1">
          {report.dailyBookings.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} booking${day.count === 1 ? "" : "s"}`}
              className="flex-1 rounded-t bg-primary/70"
              style={{ height: `${Math.max(4, (day.count / maxDailyBookings) * 100)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-canvas p-5">
          <h3 className="text-sm font-semibold text-ink">Top properties by revenue</h3>
          {report.topProperties.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No confirmed bookings yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {report.topProperties.map((property) => (
                  <tr key={property.id} className="border-t border-hairline-soft first:border-t-0">
                    <td className="py-2 pr-2">
                      <Link href={`/admin/properties/${property.id}`} className="font-medium text-ink underline">
                        {property.name}
                      </Link>
                      <p className="text-xs text-muted">{property.bookingCount} bookings</p>
                    </td>
                    <td className="py-2 text-right font-semibold text-ink">
                      {formatPrice(property.revenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-lg border border-hairline bg-canvas p-5">
          <h3 className="text-sm font-semibold text-ink">Promo code performance</h3>
          {report.promoPerformance.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No promo codes redeemed yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {report.promoPerformance.map((promo) => (
                  <tr key={promo.code} className="border-t border-hairline-soft first:border-t-0">
                    <td className="py-2 pr-2">
                      <span className="font-medium text-ink">{promo.code}</span>
                      <p className="text-xs text-muted">{promo.redemptionCount} redemptions</p>
                    </td>
                    <td className="py-2 text-right font-semibold text-ink">
                      -{formatPrice(promo.totalDiscountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportTile({ label, value, trend }: { label: string; value: string; trend?: number | null }) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm text-muted">{label}</p>
        {trend != null ? (
          <span className={trend >= 0 ? "text-xs font-semibold text-green-700" : "text-xs font-semibold text-primary-error-text"}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
