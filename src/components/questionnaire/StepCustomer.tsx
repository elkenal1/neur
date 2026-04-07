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
  { value: "65+", label: "65+" },
  { value: "all", label: "All Ages" },
];

const INCOME_LEVELS = [
  { value: "low", label: "Low Income", desc: "Under $35k/yr" },
  { value: "middle", label: "Middle Income", desc: "$35k–$75k/yr" },
  { value: "upper_middle", label: "Upper Middle", desc: "$75k–$150k/yr" },
  { value: "high", label: "High Income", desc: "$150k+/yr" },
  { value: "all", label: "All Income Levels", desc: "" },
];

export default function StepCustomer({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-navy)] mb-1">Who is your target customer?</h2>
        <p className="text-sm text-[var(--color-slate)]">We&apos;ll match your business to areas with the right customer demographics.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">Customer type</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { value: "b2c", label: "Consumers (B2C)", desc: "Sell directly to individuals" },
            { value: "b2b", label: "Businesses (B2B)", desc: "Sell to other companies" },
            { value: "both", label: "Both", desc: "Consumers and businesses" },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("customer_type", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.customer_type === value
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

      {(data.customer_type === "b2c" || data.customer_type === "both") && (
        <>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">Target age range</label>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("customer_age_range", value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    data.customer_age_range === value
                      ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-[var(--color-blue)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">Target income level</label>
            <div className="space-y-2">
              {INCOME_LEVELS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange("customer_income_level", value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    data.customer_income_level === value
                      ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
                      : "border-[var(--color-border)] hover:border-[var(--color-blue)]"
                  }`}
                >
                  <span className="font-semibold text-sm text-[var(--color-navy)]">{label}</span>
                  {desc && <span className="text-xs text-[var(--color-slate)]">{desc}</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
