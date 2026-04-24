interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const AGE_RANGES = [
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55-64", label: "55–64" },
  { value: "65+",   label: "65+" },
  { value: "all",   label: "All Ages" },
];

const INCOME_LEVELS = [
  { value: "low",          label: "Low Income",      desc: "Under $35k/yr" },
  { value: "middle",       label: "Middle Income",   desc: "$35k–$75k/yr" },
  { value: "upper_middle", label: "Upper Middle",    desc: "$75k–$150k/yr" },
  { value: "high",         label: "High Income",     desc: "$150k+/yr" },
  { value: "all",          label: "All Income Levels", desc: "" },
];

const sel = "border-[var(--color-gold)] bg-white/10";
const unsel = "border-white/15 text-white/70 hover:border-white/40 hover:bg-white/5";
const labelCls = "block text-sm font-semibold text-white/80 mb-3";

export default function StepCustomer({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white mb-1">Who is your target customer?</h2>
        <p className="text-sm text-white/50">We&apos;ll match your business to areas with the right customer demographics.</p>
      </div>

      <div>
        <label className={labelCls}>Customer type</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { value: "b2c",  label: "Consumers (B2C)", desc: "Sell directly to individuals" },
            { value: "b2b",  label: "Businesses (B2B)", desc: "Sell to other companies" },
            { value: "both", label: "Both",             desc: "Consumers and businesses" },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("customer_type", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.customer_type === value ? sel : unsel
              }`}
            >
              <div className="font-semibold text-sm text-white">{label}</div>
              <div className="text-xs text-white/50 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {(data.customer_type === "b2c" || data.customer_type === "both") && (
        <>
          <div>
            <label className={labelCls}>Target age range</label>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("customer_age_range", value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    data.customer_age_range === value
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-navy)]"
                      : "border-white/15 text-white/70 hover:border-white/40 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Target income level</label>
            <div className="space-y-2">
              {INCOME_LEVELS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("customer_income_level", value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    data.customer_income_level === value ? sel : unsel
                  }`}
                >
                  <span className="font-semibold text-sm text-white">{label}</span>
                  {desc && <span className="text-xs text-white/50">{desc}</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
