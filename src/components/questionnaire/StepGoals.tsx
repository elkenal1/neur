interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const PRIMARY_GOALS = [
  { value: "income_replacement", label: "Replace My Income", desc: "Earn enough to leave my current job" },
  { value: "lifestyle", label: "Lifestyle Business", desc: "Flexibility, autonomy, and work-life balance" },
  { value: "scale_fast", label: "Scale Fast", desc: "Build a high-growth business quickly" },
  { value: "build_and_sell", label: "Build & Sell", desc: "Create value and exit within a few years" },
  { value: "passive_income", label: "Passive Income", desc: "Generate revenue with minimal day-to-day involvement" },
];

const SECONDARY_GOALS = [
  "Community impact", "Job creation", "Family legacy",
  "Personal passion", "Financial independence", "Industry disruption",
];

export default function StepGoals({ data, onChange }: Props) {
  const secondary = (data.secondary_goals as string[]) || [];

  function toggleSecondary(goal: string) {
    if (secondary.includes(goal)) {
      onChange("secondary_goals", secondary.filter((g) => g !== goal));
    } else {
      onChange("secondary_goals", [...secondary, goal]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-navy)] mb-1">What are your goals?</h2>
        <p className="text-sm text-[var(--color-slate)]">We&apos;ll prioritize opportunities that match what matters most to you.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Primary goal
        </label>
        <div className="space-y-2">
          {PRIMARY_GOALS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("primary_goal", value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                data.primary_goal === value
                  ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-blue)]"
              }`}
            >
              <span className="font-semibold text-sm text-[var(--color-navy)]">{label}</span>
              <span className="text-xs text-[var(--color-slate)] max-w-[55%] text-right">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Anything else that matters to you? <span className="text-[var(--color-slate)] font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SECONDARY_GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleSecondary(goal)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                secondary.includes(goal)
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-navy)]"
                  : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-[var(--color-gold)]"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
