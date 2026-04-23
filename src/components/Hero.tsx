import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "310+",  label: "US Cities Analyzed" },
  { value: "50+",   label: "Industries Covered" },
  { value: "5+",    label: "Live Data Sources" },
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
      {/* Main hero */}
      <section className="relative pt-32 pb-24 px-6 bg-white overflow-hidden">

        {/* Dot grid background */}
        <div className="hero-grid absolute inset-0 opacity-50" />

        {/* Subtle gold line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, transparent, #F59E0B 40%, #F59E0B 60%, transparent)" }}
        />

        <div className="relative max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[var(--color-muted)] text-[var(--color-navy)] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-10 border border-[var(--color-border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] shrink-0" />
            US Market Intelligence Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[72px] font-extrabold leading-[1.04] tracking-tight text-[var(--color-navy)] mb-6">
            Find the right business.<br />
            <span className="relative inline-block">
              Find the right location.
              <span
                className="absolute left-0 right-0 rounded-full"
                style={{ bottom: "-4px", height: "4px", background: "var(--color-gold)", opacity: 0.7 }}
              />
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[var(--color-slate)] max-w-2xl mx-auto mb-12 leading-relaxed">
            Neur turns US Census, labor market, and local business data into a
            personalized report — so you can start your business with clarity,
            not guesswork.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-navy)] text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-[var(--color-navy-light)] transition-colors"
              style={{ boxShadow: "0 4px 24px rgba(18,18,107,0.18)" }}
            >
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-[var(--color-border)] text-[var(--color-navy)] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[var(--color-muted)] transition-colors"
            >
              See How It Works
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 border border-[var(--color-border)]"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div className="text-2xl font-extrabold text-[var(--color-navy)]">{value}</div>
                <div className="text-[11px] text-[var(--color-slate)] mt-1 font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Data sources trust bar */}
      <div className="bg-[var(--color-muted)] border-y border-[var(--color-border)] py-5 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-slate)] shrink-0">
            Powered by
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
            {sources.map((s) => (
              <span key={s} className="text-xs font-semibold text-[var(--color-slate)] opacity-70">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
