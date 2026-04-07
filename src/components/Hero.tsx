import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 bg-[var(--color-navy)] text-white">
      <div className="max-w-4xl mx-auto text-center">

        <div className="inline-block bg-white/10 text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          US Market Intelligence Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Find the Right Business.<br />
          <span className="text-[var(--color-gold)]">Find the Right Location.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
          Neur turns US Census, labor, and market data into personalized insights —
          empowering aspiring entrepreneurs and growing businesses to launch and expand with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="bg-[var(--color-gold)] text-[var(--color-navy)] font-bold px-8 py-4 rounded-xl text-base hover:bg-[var(--color-gold-light)] transition-colors shadow-lg"
          >
            Start for Free
          </Link>
          <Link
            href="#how-it-works"
            className="bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/20 transition-colors border border-white/20"
          >
            See How It Works
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
          <div>
            <div className="text-3xl font-extrabold text-[var(--color-gold)]">50+</div>
            <div className="text-xs text-white/60 mt-1 uppercase tracking-wider">Industries</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[var(--color-gold)]">3,000+</div>
            <div className="text-xs text-white/60 mt-1 uppercase tracking-wider">US Counties</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[var(--color-gold)]">5+</div>
            <div className="text-xs text-white/60 mt-1 uppercase tracking-wider">Data Sources</div>
          </div>
        </div>

      </div>
    </section>
  );
}
