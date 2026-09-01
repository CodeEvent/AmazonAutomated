export function HouseRulesSection({ houseRules }: { houseRules: string | null }) {
  if (!houseRules) return null;

  const rules = houseRules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rules.length === 0) return null;

  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">House rules</h2>
      <ul className="mt-4 space-y-3">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-ink">
            <RuleIcon />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RuleIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-muted stroke-[1.5]">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.5v4M10 13v.01" strokeLinecap="round" />
    </svg>
  );
}
