import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About — Neur",
  description: "Why we built Neur — and what we believe about entrepreneurship.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">

        {/* Hero */}
        <section className="grain text-white py-20 px-6" style={{ background: "linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-4">Our Story</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Built by someone who needed this
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Neur exists because starting a business is harder than it should be — not because of the work, but because the right information is scattered, expensive, or buried.
            </p>
          </div>
        </section>

        {/* Founder story */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-2xl mx-auto space-y-8 text-[var(--color-slate)] text-lg leading-relaxed">

            <p>
              Like a lot of people, I wanted financial independence. I wanted to stop relying on a job as my only source of income and build something of my own. The idea was there — the ambition was there. What wasn&apos;t there was clarity.
            </p>

            <p>
              Which business was right for me? Which city? Which neighborhood? What does the local competition look like? What do people in that area actually earn? Is the timing right for this industry? These questions don&apos;t have obvious answers, and finding them meant bouncing between government databases, Reddit threads, and expensive consultants who didn&apos;t know my situation.
            </p>

            <p>
              I also realized that even after making the decision — the path to being &ldquo;open for business&rdquo; is full of friction. LLC filings, EINs, business bank accounts, licenses, insurance. There&apos;s no single place that walks you through it step by step, tailored to what you&apos;re actually building.
            </p>

            <div className="border-l-4 border-[var(--color-gold)] pl-6 py-2">
              <p className="text-[var(--color-navy)] font-semibold text-xl italic">
                &ldquo;The information exists. It&apos;s just not in one place, and it&apos;s not organized around you.&rdquo;
              </p>
            </div>

            <p>
              That&apos;s why I built Neur. I wanted one platform where an aspiring entrepreneur could answer a few honest questions about their goals, budget, and target market — and walk away with real data, a clear feasibility picture, and a step-by-step plan to actually get started.
            </p>

            <p>
              The same platform should work for someone who already has a business and wants to expand into a new city. It should tell you whether the demographics match your customer, who else is already operating there, and what the labor market looks like if you need to hire.
            </p>

            <p>
              Neur is still early. But the mission is simple: <strong className="text-[var(--color-navy)]">make the information that used to require a consultant available to anyone willing to put in the work.</strong>
            </p>

          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 bg-[var(--color-muted)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-blue)] mb-3">What We Believe</p>
              <h2 className="text-3xl font-extrabold text-[var(--color-navy)]">The principles behind the product</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Data should be accessible",
                  body: "The US government publishes enormous amounts of market data. Most people never see it. We translate it into plain language that actually helps you decide.",
                },
                {
                  title: "Confidence is earned, not given",
                  body: "We don't tell you what you want to hear. We give you the numbers and let you make the call. A 62 is still useful — it tells you what to address before you commit.",
                },
                {
                  title: "The path matters as much as the idea",
                  body: "A great business idea fails without a clear path to launch. Neur gives you both — not just the analysis, but the next steps to get from analysis to open doors.",
                },
              ].map((v) => (
                <div key={v.title} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
                  <h3 className="font-bold text-[var(--color-navy)] text-base mb-3">{v.title}</h3>
                  <p className="text-sm text-[var(--color-slate)] leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="grain py-20 px-6 text-white text-center" style={{ background: "linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)" }}>
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4">Ready to find your opportunity?</h2>
            <p className="text-white/70 mb-8">Fill out your profile and get your personalized feasibility report in minutes.</p>
            <Link
              href="/sign-up"
              className="inline-block bg-[var(--color-gold)] text-[var(--color-navy)] font-bold px-8 py-4 rounded-xl text-base hover:bg-[var(--color-gold-light)] transition-colors shadow-lg"
            >
              Start for Free
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
