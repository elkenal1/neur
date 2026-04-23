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
    <section id="how-it-works" className="py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-3">The Process</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--color-navy)] tracking-tight">
            From idea to insight
          </h2>
          <p className="mt-4 text-[var(--color-slate)] max-w-lg mx-auto text-base">
            Four steps from your goals to a data-backed business decision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div
              key={step}
              className="group bg-[var(--color-muted)] rounded-2xl p-8 border border-[var(--color-border)] hover:border-[var(--color-navy)] hover:bg-white hover:shadow-lg transition-all duration-200 cursor-default"
            >
              <div className="flex items-start gap-5">
                <div
                  className="shrink-0 font-extrabold text-[var(--color-border)] group-hover:text-[var(--color-gold)] transition-colors duration-200 select-none"
                  style={{ fontSize: "52px", lineHeight: 1 }}
                >
                  {step}
                </div>
                <div>
                  <div className="bg-[var(--color-navy)] text-white rounded-xl p-2 inline-block mb-3">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-navy)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--color-slate)] leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-[var(--color-navy)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors text-sm"
            style={{ boxShadow: "0 4px 20px rgba(18,18,107,0.15)" }}
          >
            Start Your Free Analysis <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}
