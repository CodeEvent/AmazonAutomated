import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { host: { select: { name: true } }, _count: { select: { roomTypes: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Properties</h1>
        <Link
          href="/admin/properties/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-active"
        >
          + New property
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-hairline bg-canvas">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Host</th>
              <th className="px-4 py-3 font-semibold">Price/night</th>
              <th className="px-4 py-3 font-semibold">Room types</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No properties yet.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="border-b border-hairline-soft last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{property.name}</td>
                  <td className="px-4 py-3 text-body">{PROPERTY_TYPE_LABELS[property.type]}</td>
                  <td className="px-4 py-3 text-body">
                    {property.city}, {property.country}
                  </td>
                  <td className="px-4 py-3 text-body">{property.host.name}</td>
                  <td className="px-4 py-3 text-body">{formatPrice(property.pricePerNight)}</td>
                  <td className="px-4 py-3 text-body">{property._count.roomTypes}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      className="font-medium text-ink underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
