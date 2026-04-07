import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, TrendingUp, MapPin, Users, DollarSign,
  BarChart2, Lightbulb, FileText, CheckCircle, Clock
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analysis {
  id: string;
  created_at: string;
  status: string;
  entrepreneur_type: string;
  industry_preference: string;
  industry_open_to_suggestions: boolean;
  preferred_state: string;
  preferred_city: string;
  operation_type: string;
  budget_range: string;
  launch_timeline: string;
  customer_type: string;
  customer_age_range: string;
  customer_income_level: string;
  primary_goal: string;
  secondary_goals: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BUDGET_LABELS: Record<string, string> = {
  under_10k: "Under $10,000",
  "10k_50k": "$10,000 – $50,000",
  "50k_100k": "$50,000 – $100,000",
  "100k_500k": "$100,000 – $500,000",
  "500k_plus": "$500,000+",
};

const GOAL_LABELS: Record<string, string> = {
  income_replacement: "Replace My Income",
  lifestyle: "Lifestyle Business",
  scale_fast: "Scale Fast",
  build_and_sell: "Build & Sell",
  passive_income: "Passive Income",
};

// ─── Score Card ───────────────────────────────────────────────────────────────

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center">
      <div className={`text-3xl font-extrabold ${color}`}>{score}</div>
      <div className="text-xs text-[var(--color-slate)] mt-1 font-medium">{label}</div>
      <div className="mt-2 h-1.5 bg-[var(--color-muted)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace("text-", "bg-")}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Data Section ─────────────────────────────────────────────────────────────

function DataSection({
  icon: Icon, title, badge, children
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-navy)] text-white rounded-xl p-2">
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-[var(--color-navy)]">{title}</h3>
        </div>
        {badge && (
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Pending Badge ─────────────────────────────────────────────────────────────

function PendingData({ source }: { source: string }) {
  return (
    <div className="flex items-center gap-2 bg-[var(--color-muted)] rounded-lg px-4 py-3 text-sm text-[var(--color-slate)]">
      <Clock size={14} className="text-amber-500 shrink-0" />
      <span>Live data from <strong>{source}</strong> — API integration coming soon</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysis) notFound();

  const a = analysis as Analysis;
  const industry = a.industry_open_to_suggestions ? "Best Match (AI Suggested)" : a.industry_preference;
  const location = [a.preferred_city, a.preferred_state].filter(Boolean).join(", ") || "Remote / Online";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/neurlogo.png" alt="Neur" width={22} height={22} className="object-contain" />
            <span className="text-sm font-bold text-[var(--color-navy)]">NEUR</span>
          </Link>
          <span className="text-[var(--color-border)]">/</span>
          <Link href="/dashboard" className="text-sm text-[var(--color-slate)] hover:text-[var(--color-navy)] flex items-center gap-1">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] border border-[var(--color-border)] px-4 py-1.5 rounded-lg hover:bg-[var(--color-muted)] transition-colors">
          <FileText size={14} /> Download PDF
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="bg-[var(--color-navy)] text-white rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Business Analysis Report</div>
              <h1 className="text-2xl font-extrabold">{industry}</h1>
              <div className="flex items-center gap-2 mt-2 text-white/70 text-sm">
                <MapPin size={14} />
                <span>{location}</span>
                <span className="text-white/30">·</span>
                <span>{BUDGET_LABELS[a.budget_range] ?? a.budget_range}</span>
                <span className="text-white/30">·</span>
                <span>{GOAL_LABELS[a.primary_goal] ?? a.primary_goal}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-sm">
              <Clock size={14} className="text-[var(--color-gold)]" />
              <span className="text-white/80">Analysis in progress</span>
            </div>
          </div>
        </div>

        {/* Scores overview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-slate)] mb-3">Opportunity Scores</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreCard label="Market Demand" score={78} color="text-[var(--color-blue)]" />
            <ScoreCard label="Location Fit" score={85} color="text-[var(--color-emerald)]" />
            <ScoreCard label="Competition Level" score={62} color="text-amber-500" />
            <ScoreCard label="Overall Score" score={80} color="text-[var(--color-navy)]" />
          </div>
          <p className="text-xs text-[var(--color-slate)] mt-2">
            * Scores based on placeholder data. Live API integration will update these dynamically.
          </p>
        </div>

        {/* Industry Analysis */}
        <DataSection icon={TrendingUp} title="Industry Analysis" badge="BLS API">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Industry Growth (5yr)", value: "+12.4%", color: "text-[var(--color-emerald)]" },
                { label: "Avg Annual Revenue", value: "$380,000", color: "text-[var(--color-navy)]" },
                { label: "Median Profit Margin", value: "18–24%", color: "text-[var(--color-blue)]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[var(--color-muted)] rounded-xl p-4 text-center">
                  <div className={`text-xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-xs text-[var(--color-slate)] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <PendingData source="Bureau of Labor Statistics (BLS)" />
          </div>
        </DataSection>

        {/* Location & Demographics */}
        <DataSection icon={Users} title="Location & Demographics" badge="Census API">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Population", value: "1.2M", color: "text-[var(--color-navy)]" },
                { label: "Median Household Income", value: "$58,400", color: "text-[var(--color-blue)]" },
                { label: "Target Age Group %", value: "34%", color: "text-[var(--color-emerald)]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[var(--color-muted)] rounded-xl p-4 text-center">
                  <div className={`text-xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-xs text-[var(--color-slate)] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <PendingData source="US Census Bureau" />
          </div>
        </DataSection>

        {/* Competition Map */}
        <DataSection icon={MapPin} title="Competition Map" badge="Google Maps + Yelp">
          <div className="space-y-3">
            <div className="bg-[var(--color-muted)] rounded-xl h-52 flex items-center justify-center text-[var(--color-slate)] text-sm">
              <div className="text-center">
                <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium">Interactive map coming with Google Maps API</p>
                <p className="text-xs mt-1 opacity-70">Will show competitor locations, foot traffic, and market gaps</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Direct Competitors Nearby", value: "8", color: "text-amber-500" },
                { label: "Avg Competitor Rating", value: "3.8 ★", color: "text-[var(--color-navy)]" },
                { label: "Market Gap Score", value: "High", color: "text-[var(--color-emerald)]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[var(--color-muted)] rounded-xl p-4 text-center">
                  <div className={`text-xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-xs text-[var(--color-slate)] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <PendingData source="Google Maps API + Yelp Fusion API" />
          </div>
        </DataSection>

        {/* Labor Market */}
        <DataSection icon={BarChart2} title="Labor Market" badge="BLS API">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Local Unemployment Rate", value: "3.8%", color: "text-[var(--color-emerald)]" },
                { label: "Avg Hourly Wage (Industry)", value: "$18.40", color: "text-[var(--color-navy)]" },
                { label: "Labor Availability", value: "High", color: "text-[var(--color-blue)]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[var(--color-muted)] rounded-xl p-4 text-center">
                  <div className={`text-xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-xs text-[var(--color-slate)] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <PendingData source="Bureau of Labor Statistics (BLS)" />
          </div>
        </DataSection>

        {/* Financing Options */}
        <DataSection icon={DollarSign} title="Financing Options" badge="SBA">
          <div className="space-y-2">
            {[
              { name: "SBA 7(a) Loan", desc: "Up to $5M — general business purposes", badge: "Best Match" },
              { name: "SBA Microloan", desc: "Up to $50,000 — ideal for startups", badge: "" },
              { name: "USDA Business Loan", desc: "Rural area financing options", badge: "" },
            ].map(({ name, desc, badge }) => (
              <div key={name} className="flex items-center justify-between px-4 py-3 bg-[var(--color-muted)] rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-[var(--color-navy)]">{name}</div>
                  <div className="text-xs text-[var(--color-slate)]">{desc}</div>
                </div>
                {badge && (
                  <span className="text-xs font-bold bg-[var(--color-emerald)] text-white px-2.5 py-1 rounded-full shrink-0">
                    {badge}
                  </span>
                )}
              </div>
            ))}
            <PendingData source="SBA.gov API" />
          </div>
        </DataSection>

        {/* Next Steps */}
        <DataSection icon={Lightbulb} title="Recommended Next Steps">
          <div className="space-y-2">
            {[
              "Validate your concept by talking to 10 potential customers in your target area",
              "Register your business entity (LLC recommended) with your state",
              "Research local zoning laws for your business type",
              "Apply for an EIN (Employer Identification Number) with the IRS — free and instant",
              "Open a dedicated business bank account",
              "Consult a Neur advisor for a 1-on-1 strategy session",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 bg-[var(--color-muted)] rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[var(--color-navy)] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-[var(--color-foreground)]">{step}</p>
              </div>
            ))}
          </div>
        </DataSection>

        {/* Submit for human review */}
        <div className="bg-[var(--color-gold)]/10 border border-[var(--color-gold)] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[var(--color-navy)]">Want a deeper analysis?</h3>
            <p className="text-sm text-[var(--color-slate)] mt-1">
              Book a 1-on-1 consultation with a Neur advisor who will review your report and guide your next steps.
            </p>
          </div>
          <Link
            href="/sign-up?plan=consultation"
            className="shrink-0 bg-[var(--color-navy)] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[var(--color-navy-light)] transition-colors"
          >
            Book Consultation
          </Link>
        </div>

        {/* Submission summary */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
          <h3 className="font-bold text-[var(--color-navy)] mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-[var(--color-emerald)]" /> Your Questionnaire Summary
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Type", a.entrepreneur_type === "new" ? "Aspiring Entrepreneur" : "Expanding Business"],
              ["Industry", industry],
              ["Location", location],
              ["Operation", a.operation_type],
              ["Budget", BUDGET_LABELS[a.budget_range] ?? a.budget_range],
              ["Timeline", a.launch_timeline?.replace(/_/g, " ")],
              ["Primary Goal", GOAL_LABELS[a.primary_goal] ?? a.primary_goal],
              ["Customer Type", a.customer_type?.toUpperCase()],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between bg-[var(--color-muted)] px-4 py-2.5 rounded-lg">
                <span className="text-[var(--color-slate)]">{label}</span>
                <span className="font-semibold text-[var(--color-navy)] capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
