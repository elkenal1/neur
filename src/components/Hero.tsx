import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "310+", label: "US Cities Analyzed" },
  { value: "50+",  label: "Industries Covered" },
  { value: "5+",   label: "Live Data Sources" },
];

const sources = [
  "US Census Bureau",
  "Bureau of Labor Statistics",
  "Google Maps",
  "SBA.gov",
  "Yelp Fusion",
];

export default function Hero() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="grain relative pt-32 pb-28 px-6 overflow-hidden"
        style={{
          background: "linear-gradient(140deg, #06061a 0%, #12126B 50%, #080824 100%)",
        }}
      >
        {/* Gold radial glow behind headline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 10%, rgba(245,158,11,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">

          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)] opacity-80">
              Market Intelligence for Entrepreneurs
            </span>
            <div className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[70px] font-extrabold leading-[1.05] tracking-tight text-white mb-6">
            Launch with clarity,<br />
            <span style={{ color: "var(--color-gold)" }}>Grow with confidence.</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            Neur delivers continuous market, demographic, and labor insights
            tailored to your sector.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-sm transition-all"
              style={{
                background: "var(--color-gold)",
                color: "var(--color-navy)",
                boxShadow: "0 4px 28px rgba(245,158,11,0.35)",
              }}
            >
              Start for Free <ArrowRight size={15} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl text-sm transition-all"
              style={{
                color: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              See How It Works
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <div
                  className="text-[11px] font-medium mt-0.5 leading-tight"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#0a0a20",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        className="py-5 px-6"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] shrink-0"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            Powered by
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1">
            {sources.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
