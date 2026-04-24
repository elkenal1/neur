interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const INDUSTRIES = [
  "Food & Beverage", "Retail", "Health & Wellness", "Fitness",
  "Technology", "Professional Services", "Education & Tutoring",
  "Real Estate", "Beauty & Personal Care", "Home Services",
  "Childcare", "Entertainment", "Automotive", "Finance",
  "Construction", "E-commerce", "Hospitality", "Transportation",
  "Agriculture", "Manufacturing",
];

const labelCls = "block text-sm font-semibold text-white/80 mb-3";
const inputCls = "w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 outline-none transition";
const inputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' };

export default function StepIndustry({ data, onChange }: Props) {
  const selected = (data.industry_preference as string) || "";
  const openToSuggestions = data.industry_open_to_suggestions as boolean;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white mb-1">What industry interests you?</h2>
        <p className="text-sm text-white/50">Pick one or let Neur suggest the best fit based on your profile.</p>
      </div>

      <button
        type="button"
        onClick={() => {
          onChange("industry_open_to_suggestions", !openToSuggestions);
          if (!openToSuggestions) onChange("industry_preference", "");
        }}
        className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
          openToSuggestions
            ? "border-[var(--color-gold)] bg-white/10 text-white"
            : "border-white/15 text-white/70 hover:border-[var(--color-gold)] hover:bg-white/5"
        }`}
      >
        🎯 Help me find the right industry
      </button>

      {!openToSuggestions && (
        <div>
          <label className={labelCls}>Or choose an industry:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => onChange("industry_preference", industry)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium text-left transition-all ${
                  selected === industry
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-navy)]"
                    : "border-white/15 text-white/70 hover:border-white/40 hover:bg-white/5"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className={labelCls}>Don&apos;t see your industry? Type it:</label>
            <input
              type="text"
              value={INDUSTRIES.includes(selected) ? "" : selected}
              onChange={(e) => onChange("industry_preference", e.target.value)}
              placeholder="e.g. Craft Brewery, Dog Grooming..."
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
