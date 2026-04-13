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

      {/* Entrepreneur type */}
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

      {/* Prior experience */}
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

      {/* Commitment level */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          How will you be committing to this business?
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { value: "full_time", label: "Full-Time", desc: "This will be my primary focus" },
            { value: "part_time", label: "Part-Time", desc: "I'll run this alongside other commitments" },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("commitment_level", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.commitment_level === value
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

      {/* Business partners */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Will you have business partners?
        </label>
        <div className="flex gap-3">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onChange("has_business_partners", value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.has_business_partners === value
                  ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-[var(--color-blue)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prior business ownership */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Have you owned a business before?
        </label>
        <div className="space-y-2">
          {[
            { value: "never", label: "Never", desc: "This is my first time" },
            { value: "previously_owned", label: "Previously Owned", desc: "I've owned a business in the past" },
            { value: "currently_own", label: "Currently Own", desc: "I already own an active business" },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("prior_business_ownership", value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                data.prior_business_ownership === value
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

    </div>
  );
}
