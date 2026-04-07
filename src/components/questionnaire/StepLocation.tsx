interface Props {
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const OPERATION_TYPES = [
  { value: "physical", label: "Physical Location", desc: "Storefront, office, or facility" },
  { value: "online", label: "Online / Remote", desc: "No physical location needed" },
  { value: "both", label: "Both", desc: "Physical presence + online" },
];

export default function StepLocation({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-navy)] mb-1">Where do you want to operate?</h2>
        <p className="text-sm text-[var(--color-slate)]">We&apos;ll analyze market conditions in your target area.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">Operation type</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {OPERATION_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("operation_type", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.operation_type === value
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

      {data.operation_type !== "online" && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">State</label>
              <select
                value={(data.preferred_state as string) || ""}
                onChange={(e) => onChange("preferred_state", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] bg-white transition"
              >
                <option value="">Select a state...</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">City (optional)</label>
              <input
                type="text"
                value={(data.preferred_city as string) || ""}
                onChange={(e) => onChange("preferred_city", e.target.value)}
                placeholder="e.g. Austin, Miami..."
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="relocation"
              checked={(data.open_to_relocation as boolean) || false}
              onChange={(e) => onChange("open_to_relocation", e.target.checked)}
              className="w-4 h-4 accent-[var(--color-navy)]"
            />
            <label htmlFor="relocation" className="text-sm text-[var(--color-slate)]">
              I&apos;m open to other locations if the data shows a better opportunity
            </label>
          </div>
        </>
      )}
    </div>
  );
}
