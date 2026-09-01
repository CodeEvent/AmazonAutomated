export function MapSection({
  latitude,
  longitude,
  address,
  city,
  country,
}: {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}) {
  const delta = 0.01;
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join("%2C");
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const largerMapHref = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">Where you&apos;ll be</h2>
      <p className="mt-1 text-sm text-muted">
        {address}, {city}, {country}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-hairline">
        <iframe
          title="Property location"
          src={embedSrc}
          className="h-[360px] w-full"
          loading="lazy"
        />
      </div>
      <a
        href={largerMapHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm font-medium text-ink underline"
      >
        View larger map
      </a>
    </section>
  );
}
