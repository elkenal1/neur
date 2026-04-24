import Link from "next/link";
import { ClipboardList, BarChart2, MapPin, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Tell Us About Your Goals",
    description:
      "Answer a short questionnaire about your budget, interests, target customers, and preferred location. No experience required — takes under 5 minutes.",
  },
  {
    icon: BarChart2,
    step: "02",
    title: "We Analyze the Data",
    description:
      "Neur cross-references US Census demographics, Bureau of Labor Statistics trends, competition data, and local market signals to build your profile.",
  },
  {
    icon: MapPin,
    step: "03",
    title: "Explore Your Matches",
    description:
      "Browse an interactive map with scored locations and industry recommendations tailored to your criteria — all in one dashboard.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Get Your Report",
    description:
      "Download a personalized PDF report with your feasibility score, market data, comparable cities, and a step-by-step action plan.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6" style={{ background: "#F7F4EF" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-6" style={{ background: "var(--color-navy)", opacity: 0.3 }} />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--color-navy)", opacity: 0.5 }}
            >
              The Process
            </span>
            <div className="h-px w-6" style={{ background: "var(--color-navy)", opacity: 0.3 }} />
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--color-navy)" }}
          >
            From idea to insight
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-base" style={{ color: "var(--color-slate)" }}>
            Four steps from your goals to a data-backed business decision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div
              key={step}
              className="group rounded-2xl p-8 border transition-all duration-200 hover:shadow-xl cursor-default"
              style={{
                background: "#ffffff",
                borderColor: "rgba(18,18,107,0.08)",
              }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="shrink-0 font-extrabold select-none transition-colors duration-200 group-hover:text-[var(--color-gold)]"
                  style={{
                    fontSize: "52px",
                    lineHeight: 1,
                    color: "rgba(18,18,107,0.10)",
                  }}
                >
                  {step}
                </div>
                <div>
                  <div
                    className="text-white rounded-xl p-2 inline-block mb-3"
                    style={{ background: "var(--color-navy)" }}
                  >
                    <Icon size={16} />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-slate)" }}>
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors hover:opacity-90"
            style={{
              background: "var(--color-navy)",
              boxShadow: "0 4px 20px rgba(18,18,107,0.18)",
            }}
          >
            Start Your Free Analysis <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}
