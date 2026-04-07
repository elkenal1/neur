import { ClipboardList, BarChart2, MapPin, FileText } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Tell Us About Your Goals",
    description:
      "Answer a short questionnaire about your budget, interests, target customers, and preferred location. No experience required.",
  },
  {
    icon: BarChart2,
    step: "02",
    title: "We Analyze the Data",
    description:
      "Neur cross-references US Census demographics, Bureau of Labor Statistics trends, Yelp competition data, and Google Maps traffic to build your profile.",
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
      "Download a personalized PDF report with your top business and location recommendations, market data, and actionable next steps.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-blue)] mb-3">The Process</p>
          <h2 className="text-4xl font-extrabold text-[var(--color-navy)]">How Neur Works</h2>
          <p className="mt-4 text-[var(--color-slate)] max-w-xl mx-auto">
            From your goals to a clear business plan — in four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[var(--color-navy)] text-white rounded-xl p-2.5">
                  <Icon size={18} />
                </div>
                <span className="text-xs font-bold text-[var(--color-slate)] tracking-widest">STEP {step}</span>
              </div>
              <h3 className="text-base font-bold text-[var(--color-navy)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--color-slate)] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
