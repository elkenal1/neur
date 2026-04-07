import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "One-Time",
    price: null,
    label: "From $99",
    description: "A single in-depth consultation with a personalized report.",
    features: [
      "Full intake questionnaire",
      "Business & location analysis",
      "Interactive dashboard access",
      "Downloadable PDF report",
      "Human review included",
    ],
    cta: "Book a Consultation",
    href: "/sign-up?plan=consultation",
    highlight: false,
  },
  {
    name: "Monthly",
    price: "$20",
    label: "per month",
    description: "Full platform access — browse, analyze, and plan on your schedule.",
    features: [
      "Unlimited location browsing",
      "Live US market data",
      "Industry trend insights",
      "Financing options hub",
      "Business launch guides",
      "Downloadable PDF reports",
    ],
    cta: "Get Started",
    href: "/sign-up?plan=monthly",
    highlight: true,
  },
  {
    name: "Annual",
    price: "$200",
    label: "per year",
    description: "Everything in Monthly — save 2 months free.",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Get Started",
    href: "/sign-up?plan=annual",
    highlight: false,
  },
  {
    name: "Consultant",
    price: null,
    label: "Enterprise",
    description: "A dedicated Neur portal for independent consultants to use with clients.",
    features: [
      "Branded consultant portal",
      "Multi-client management",
      "Client report generation",
      "White-label PDF reports",
      "Priority support",
    ],
    cta: "Contact Us",
    href: "/contact?plan=consultant",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[var(--color-muted)]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-blue)] mb-3">Pricing</p>
          <h2 className="text-4xl font-extrabold text-[var(--color-navy)]">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-[var(--color-slate)] max-w-xl mx-auto">
            Start with a one-time consultation or subscribe for ongoing access to all of Neur&apos;s tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col border ${
                plan.highlight
                  ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)] shadow-xl scale-105"
                  : "bg-white text-[var(--color-foreground)] border-[var(--color-border)] shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-3">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${plan.highlight ? "text-white" : "text-[var(--color-navy)]"}`}>
                  {plan.name}
                </h3>
                <div className={`mt-1 text-3xl font-extrabold ${plan.highlight ? "text-[var(--color-gold)]" : "text-[var(--color-navy)]"}`}>
                  {plan.price ?? plan.label}
                </div>
                {plan.price && (
                  <div className={`text-xs mt-0.5 ${plan.highlight ? "text-white/60" : "text-[var(--color-slate)]"}`}>
                    {plan.label}
                  </div>
                )}
              </div>

              <p className={`text-sm mb-5 leading-relaxed ${plan.highlight ? "text-white/70" : "text-[var(--color-slate)]"}`}>
                {plan.description}
              </p>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={15} className={`mt-0.5 shrink-0 ${plan.highlight ? "text-[var(--color-gold)]" : "text-[var(--color-emerald)]"}`} />
                    <span className={plan.highlight ? "text-white/80" : "text-[var(--color-slate)]"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`text-center text-sm font-bold px-4 py-3 rounded-xl transition-colors ${
                  plan.highlight
                    ? "bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)]"
                    : "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
