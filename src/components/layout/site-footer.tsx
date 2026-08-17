const FOOTER_COLUMNS = [
  {
    title: "Support",
    links: ["Help center", "Cancellation options", "Contact us", "Safety information"],
  },
  {
    title: "Hosting",
    links: ["List your property", "Host resources", "Community forum", "Responsible hosting"],
  },
  {
    title: "Wayfarer",
    links: ["About us", "Careers", "Press", "Gift cards"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-base font-medium text-ink">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-ink">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline-soft pt-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Wayfarer, Inc.</span>
          <div className="flex gap-4">
            <span>English (US)</span>
            <span>USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
