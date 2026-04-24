interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const BUDGETS = [
  { value: "under_10k",   label: "Under $10,000",        desc: "Home-based or micro business" },
  { value: "10k_50k",     label: "$10,000 – $50,000",    desc: "Small service or retail" },
  { value: "50k_100k",    label: "$50,000 – $100,000",   desc: "Mid-size storefront or franchise" },
  { value: "100k_500k",   label: "$100,000 – $500,000",  desc: "Established location or multi-unit" },
  { value: "500k_plus",   label: "$500,000+",             desc: "Large scale or multi-location" },
];

const TIMELINES = [
  { value: "asap",          label: "ASAP",         desc: "Within 3 months" },
  { value: "3_6_months",    label: "3–6 Months",   desc: "Planning phase" },
  { value: "6_12_months",   label: "6–12 Months",  desc: "Researching & preparing" },
  { value: "1_plus_years",  label: "1+ Years",     desc: "Long-term planning" },
];

const sel = "border-[var(--color-gold)] bg-white/10 text-white";
const unsel = "border-white/15 text-white/70 hover:border-white/40 hover:bg-white/5";
const labelCls = "block text-sm font-semibold text-white/80 mb-3";

export default function StepBudget({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white mb-1">Budget &amp; Timeline</h2>
        <p className="text-sm text-white/50">This helps us filter realistic opportunities for your situation.</p>
      </div>

      <div>
        <label className={labelCls}>Available startup capital</label>
        <div className="space-y-2">
          {BUDGETS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("budget_range", value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                data.budget_range === value ? sel : unsel
              }`}
            >
              <span className="font-semibold text-sm text-white">{label}</span>
              <span className="text-xs text-white/50">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Target launch timeline</label>
        <div className="grid grid-cols-2 gap-3">
          {TIMELINES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("launch_timeline", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.launch_timeline === value ? sel : unsel
              }`}
            >
              <div className="font-semibold text-sm text-white">{label}</div>
              <div className="text-xs text-white/50 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
