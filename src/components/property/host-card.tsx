import type { Host } from "@/generated/prisma/client";

export function HostCard({ host }: { host: Host }) {
  const initial = host.name.trim().charAt(0).toUpperCase();

  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">Meet your host</h2>

      <div className="mt-4 flex items-center justify-between gap-6 rounded-xl border border-hairline-soft p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ink text-2xl font-semibold text-canvas">
              {host.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={host.image} alt={host.name} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            {host.isSuperhost ? (
              <span
                aria-label="Verified Superhost"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-canvas shadow-card"
              >
                <CheckIcon />
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-lg font-semibold text-ink">{host.name}</p>
          {host.isSuperhost ? <p className="text-sm text-muted">Superhost</p> : null}
        </div>

        <div className="flex-1 divide-y divide-hairline-soft text-right">
          <div className="pb-3">
            <p className="text-xl font-bold text-ink">{host.reviewCount}</p>
            <p className="text-sm text-muted">Reviews</p>
          </div>
          <div className="py-3">
            <p className="flex items-center justify-end gap-1 text-xl font-bold text-ink">
              {host.ratingAverage.toFixed(2)} <StarIcon />
            </p>
            <p className="text-sm text-muted">Rating</p>
          </div>
          <div className="pt-3">
            <p className="text-xl font-bold text-ink">{host.yearsHosting}</p>
            <p className="text-sm text-muted">Years hosting</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {host.education ? (
          <p className="flex items-center gap-3 text-base text-ink">
            <CapIcon /> Where I went to school: {host.education}
          </p>
        ) : null}
        {host.work ? (
          <p className="flex items-center gap-3 text-base text-ink">
            <BriefcaseIcon /> My work: {host.work}
          </p>
        ) : null}
      </div>

      {host.bio ? <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-body">{host.bio}</p> : null}

      {host.isSuperhost ? (
        <div className="mt-6 border-t border-hairline-soft pt-6">
          <p className="text-base font-semibold text-ink">{host.name} is a Superhost</p>
          <p className="mt-1 text-sm text-muted">
            Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
          </p>
        </div>
      ) : null}

      <div className="mt-6 border-t border-hairline-soft pt-6">
        <h3 className="text-base font-semibold text-ink">Host details</h3>
        <p className="mt-1 text-sm text-muted">Response rate: {host.responseRatePercent}%</p>
        <p className="text-sm text-muted">Responds within an hour</p>
      </div>

      <a
        href="#reserve"
        className="mt-6 block w-full rounded-lg border border-hairline-soft py-3 text-center text-base font-semibold text-ink hover:bg-surface-soft"
      >
        Message host
      </a>
    </section>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-ink">
      <path d="M8 0l2.163 5.279 5.837.451-4.5 3.792L12.9 15.5 8 12.2 3.1 15.5l1.4-5.978L0 5.73l5.837-.451z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-canvas stroke-[2.5]">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0 fill-none stroke-ink stroke-[1.5]">
      <path d="M12 4L2 9l10 5 8-4v6M6 11v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0 fill-none stroke-ink stroke-[1.5]">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
