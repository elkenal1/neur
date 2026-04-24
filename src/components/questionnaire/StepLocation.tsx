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
  { value: "online",   label: "Online / Remote",   desc: "No physical location needed" },
  { value: "both",     label: "Both",               desc: "Physical presence + online" },
];

const sel = "border-[var(--color-gold)] bg-white/10 text-white";
const unsel = "border-white/15 text-white/70 hover:border-white/40 hover:bg-white/5";
const labelCls = "block text-sm font-semibold text-white/80 mb-2";
const inputCls = "w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 outline-none transition";
const inputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' };

export default function StepLocation({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white mb-1">Where do you want to operate?</h2>
        <p className="text-sm text-white/50">We&apos;ll analyze market conditions in your target area.</p>
      </div>

      <div>
        <label className={labelCls}>Operation type</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {OPERATION_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("operation_type", value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.operation_type === value ? sel : unsel
              }`}
            >
              <div className="font-semibold text-sm text-white">{label}</div>
              <div className="text-xs text-white/50 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {data.operation_type !== "online" && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>State</label>
              <select
                value={(data.preferred_state as string) || ""}
                onChange={(e) => onChange("preferred_state", e.target.value)}
                className={inputCls}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              >
                <option value="" style={{ background: '#12126B' }}>Select a state...</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state} style={{ background: '#12126B' }}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>City (optional)</label>
              <input
                type="text"
                value={(data.preferred_city as string) || ""}
                onChange={(e) => onChange("preferred_city", e.target.value)}
                placeholder="e.g. Austin, Miami..."
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="relocation"
              checked={(data.open_to_relocation as boolean) || false}
              onChange={(e) => onChange("open_to_relocation", e.target.checked)}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            <label htmlFor="relocation" className="text-sm text-white/60">
              I&apos;m open to other locations if the data shows a better opportunity
            </label>
          </div>
        </>
      )}
    </div>
  );
}
