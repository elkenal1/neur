interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const BUDGETS = [
  { value: "under_10k", label: "Under $10,000", desc: "Home-based or micro business" },
  { value: "10k_50k", label: "$10,000 – $50,000", desc: "Small service or retail" },
  { value: "50k_100k", label: "$50,000 – $100,000", desc: "Mid-size storefront or franchise" },
  { value: "100k_500k", label: "$100,000 – $500,000", desc: "Established location or multi-unit" },
  { value: "500k_plus", label: "$500,000+", desc: "Large scale or multi-location" },
];

const TIMELINES = [
  { value: "asap", label: "ASAP", desc: "Within 3 months" },
  { value: "3_6_months", label: "3–6 Months", desc: "Planning phase" },
  { value: "6_12_months", label: "6–12 Months", desc: "Researching & preparing" },
  { value: "1_plus_years", label: "1+ Years", desc: "Long-term planning" },
];

export default function StepBudget({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-navy)] mb-1">Budget & Timeline</h2>
        <p className="text-sm text-[var(--color-slate)]">This helps us filter realistic opportunities for your situation.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Available startup capital
        </label>
        <div className="space-y-2">
          {BUDGETS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("budget_range", value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                data.budget_range === value
                  ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-blue)]"
              }`}
            >
              <span className="font-semibold text-sm text-[var(--color-navy)]">{label}</span>
              <span className="text-xs text-[var(--color-slate)]">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Target launch timeline
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TIMELINES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("launch_timeline", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.launch_timeline === value
                  ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-blue)]"
              }`}
            >
              <div className="font-semibold text-sm text-[var(--color-navy)]">{label}</div>
              <div className="text-xs text-[var(--color-slate)] mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
