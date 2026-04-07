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

export default function StepIndustry({ data, onChange }: Props) {
  const selected = (data.industry_preference as string) || "";
  const openToSuggestions = data.industry_open_to_suggestions as boolean;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-navy)] mb-1">What industry interests you?</h2>
        <p className="text-sm text-[var(--color-slate)]">Pick one or let Neur suggest the best fit based on your profile.</p>
      </div>

      <button
        type="button"
        onClick={() => {
          onChange("industry_open_to_suggestions", !openToSuggestions);
          if (!openToSuggestions) onChange("industry_preference", "");
        }}
        className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
          openToSuggestions
            ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-navy)]"
            : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-[var(--color-gold)]"
        }`}
      >
        ✨ Help me find the right industry
      </button>

      {!openToSuggestions && (
        <div>
          <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-3">
            Or choose an industry:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => onChange("industry_preference", industry)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium text-left transition-all ${
                  selected === industry
                    ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-[var(--color-blue)] hover:text-[var(--color-navy)]"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              Don&apos;t see your industry? Type it:
            </label>
            <input
              type="text"
              value={INDUSTRIES.includes(selected) ? "" : selected}
              onChange={(e) => onChange("industry_preference", e.target.value)}
              placeholder="e.g. Craft Brewery, Dog Grooming..."
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
