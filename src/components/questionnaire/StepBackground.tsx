import { BuildingIcon, TrendingUp } from "lucide-react";

interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const sel = "border-[var(--color-gold)] bg-white/10 text-white";
const unsel = "border-white/15 text-white/70 hover:border-white/40 hover:bg-white/5";
const selFull = "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-navy)]";
const unselFull = "border-white/15 text-white/70 hover:border-white/40";
const labelCls = "block text-sm font-semibold text-white/80 mb-3";
const inputCls = "w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 outline-none transition";
const inputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' };

export default function StepBackground({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white mb-1">Tell us about yourself</h2>
        <p className="text-sm text-white/50">This helps us tailor your analysis to your situation.</p>
      </div>

      {/* Entrepreneur type */}
      <div>
        <label className={labelCls}>What best describes you?</label>
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
                data.entrepreneur_type === value ? sel : unsel
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${data.entrepreneur_type === value ? "bg-[var(--color-gold)] text-[var(--color-navy)]" : "bg-white/10 text-white/60"}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{label}</div>
                <div className="text-xs text-white/50 mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prior experience */}
      <div>
        <label className={labelCls}>Do you have prior business or industry experience?</label>
        <div className="flex gap-3">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onChange("has_industry_experience", value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.has_industry_experience === value ? selFull : unselFull
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.has_industry_experience === true && (
        <div>
          <label className={labelCls}>What industry have you worked in?</label>
          <input
            type="text"
            value={(data.current_industry as string) || ""}
            onChange={(e) => onChange("current_industry", e.target.value)}
            placeholder="e.g. Restaurant, Retail, Technology..."
            className={inputCls}
            style={inputStyle}
          />
        </div>
      )}

      {/* Commitment level */}
      <div>
        <label className={labelCls}>How will you be committing to this business?</label>
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
                data.commitment_level === value ? sel : unsel
              }`}
            >
              <div className="font-semibold text-sm text-white">{label}</div>
              <div className="text-xs text-white/50 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Business partners */}
      <div>
        <label className={labelCls}>Will you have business partners?</label>
        <div className="flex gap-3">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onChange("has_business_partners", value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.has_business_partners === value ? selFull : unselFull
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prior business ownership */}
      <div>
        <label className={labelCls}>Have you owned a business before?</label>
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
                data.prior_business_ownership === value ? sel : unsel
              }`}
            >
              <span className="font-semibold text-sm text-white">{label}</span>
              <span className="text-xs text-white/50">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
