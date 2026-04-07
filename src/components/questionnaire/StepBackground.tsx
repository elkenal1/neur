import { BuildingIcon, TrendingUp } from "lucide-react";

interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

export default function StepBackground({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-navy)] mb-1">Tell us about yourself</h2>
        <p className="text-sm text-[var(--color-slate)]">This helps us tailor your analysis to your situation.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          What best describes you?
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { value: "new", icon: BuildingIcon, label: "Aspiring Entrepreneur", desc: "I want to start my first business" },
            { value: "expanding", icon: TrendingUp, label: "Business Owner", desc: "I want to expand or open a new location" },
          ].map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("entrepreneur_type", value)}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                data.entrepreneur_type === value
                  ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-blue)]"
              }`}
            >
              <div className={`p-2 rounded-lg ${data.entrepreneur_type === value ? "bg-[var(--color-navy)] text-white" : "bg-[var(--color-muted)] text-[var(--color-slate)]"}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--color-navy)]">{label}</div>
                <div className="text-xs text-[var(--color-slate)] mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Do you have prior business or industry experience?
        </label>
        <div className="flex gap-3">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onChange("has_industry_experience", value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.has_industry_experience === value
                  ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-[var(--color-blue)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.has_industry_experience === true && (
        <div>
          <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
            What industry have you worked in?
          </label>
          <input
            type="text"
            value={(data.current_industry as string) || ""}
            onChange={(e) => onChange("current_industry", e.target.value)}
            placeholder="e.g. Restaurant, Retail, Technology..."
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      )}
    </div>
  );
}
