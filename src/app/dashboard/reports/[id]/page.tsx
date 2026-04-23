export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect, notFound } from "next/navigation";
import { calculateFeasibilityScore, type FeasibilityScore } from "@/lib/feasibility";
import { fetchCensusData, fetchBLSData, fetchGeocode, fetchPlaces, type PlaceResult } from "@/lib/api";
import { findComparableCities } from "@/lib/comparableCities";
import FeasibilitySection from "@/components/reports/FeasibilitySection";
import ComparableCitiesSection from "@/components/reports/ComparableCitiesSection";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, TrendingUp, MapPin, Users, DollarSign,
  BarChart2, FileText, CheckCircle, Clock,
  AlertCircle, Lock
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
  // new fields
  has_industry_experience: boolean;
  current_industry: string;
  commitment_level: string;
  has_business_partners: boolean;
  prior_business_ownership: string;
  feasibility_score: FeasibilityScore | null;
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function DataSection({ icon: Icon, title, badge, children }: {
  icon: React.ElementType; title: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-navy)] text-white rounded-xl p-2"><Icon size={16} /></div>
          <h3 className="font-bold text-[var(--color-navy)]">{title}</h3>
        </div>
        {badge && <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, color = "text-[var(--color-navy)]" }: {
  label: string; value: string; color?: string;
}) {
  return (
    <div className="bg-[var(--color-muted)] rounded-xl p-4 text-center">
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-[var(--color-slate)] mt-1">{label}</div>
    </div>
  );
}

function LockedSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="p-6 filter blur-[2px] pointer-events-none select-none opacity-50">
        <div className="h-4 bg-[var(--color-muted)] rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="bg-[var(--color-muted)] rounded-xl h-20" />)}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center" />
      <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)] px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock size={16} className="text-[var(--color-navy)] shrink-0" />
          <div>
            <div className="text-sm font-bold text-[var(--color-navy)]">{title}</div>
            <div className="text-xs text-[var(--color-slate)]">{description}</div>
          </div>
        </div>
        <Link
          href="/sign-up?plan=monthly"
          className="shrink-0 bg-[var(--color-navy)] text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--color-navy-light)] transition-colors whitespace-nowrap"
        >
          Unlock — $20/mo
        </Link>
      </div>
    </div>
  );
}

function PendingData({ source }: { source: string }) {
  return (
    <div className="flex items-center gap-2 bg-[var(--color-muted)] rounded-lg px-4 py-3 text-sm text-[var(--color-slate)]">
      <Clock size={14} className="text-amber-500 shrink-0" />
      <span>Live data from <strong>{source}</strong> — integration coming soon</span>
    </div>
  );
}

function ErrorData({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
      <AlertCircle size={14} className="shrink-0" /><span>{message}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: analysis, error }, { data: profile }] = await Promise.all([
    supabase.from("analyses").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabaseAdmin.from("profiles").select("plan").eq("id", user.id).single(),
  ]);

  if (error || !analysis) notFound();

  const a = analysis as Analysis;
  const plan = profile?.plan ?? "free";
  const isPaid = ["monthly", "annual", "consultant", "admin"].includes(plan);

  const industry = a.industry_open_to_suggestions ? "" : a.industry_preference;
  const displayIndustry = a.industry_open_to_suggestions ? "Best Match (AI Suggested)" : a.industry_preference;
  const location = [a.preferred_city, a.preferred_state].filter(Boolean).join(", ") || "Remote / Online";

  // Fetch census + BLS in parallel, then geocode + places if we have a city
  const [censusData, blsData] = await Promise.all([
    a.preferred_state ? fetchCensusData(a.preferred_state, a.preferred_city || undefined) : null,
    industry ? fetchBLSData(industry) : null,
  ]);

  // Fetch competitor places if we have a city to geocode
  let competitorPlaces: PlaceResult[] = [];
  if (a.preferred_city && a.preferred_state && industry) {
    const geo = await fetchGeocode(a.preferred_city, a.preferred_state);
    if (geo) {
      const placesData = await fetchPlaces(geo.lat, geo.lng, industry);
      competitorPlaces = placesData?.places ?? [];
    }
  }

  // Use cached feasibility score or calculate fresh
  let feasibilityScore: FeasibilityScore | null = a.feasibility_score ?? null;
  if (!feasibilityScore) {
    feasibilityScore = calculateFeasibilityScore({
      analysis: a,
      blsData,
      censusData,
      competitorPlaces,
      radiusMiles: 5,
    });
    // Save to DB so future loads use the cached version
    await supabaseAdmin
      .from('analyses')
      .update({ feasibility_score: feasibilityScore })
      .eq('id', a.id);
  }

  // Comparable cities — only for paid users with a city + census data
  const comparableCities = (isPaid && censusData && !censusData.error && a.preferred_city && a.preferred_state)
    ? await findComparableCities(censusData, a.preferred_city, a.preferred_state)
    : null;

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
        {isPaid ? (
          <a
            href={`/api/report-pdf?id=${a.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] border border-[var(--color-border)] px-4 py-1.5 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          >
            <FileText size={14} /> Download PDF
          </a>
        ) : (
          <Link
            href="/sign-up?plan=monthly"
            className="flex items-center gap-2 text-sm font-semibold bg-[var(--color-gold)] text-[var(--color-navy)] px-4 py-1.5 rounded-lg hover:bg-[var(--color-gold-light)] transition-colors"
          >
            <Lock size={14} /> Unlock Full Report
          </Link>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="bg-[var(--color-navy)] text-white rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Business Analysis Report</div>
              <h1 className="text-2xl font-extrabold">{displayIndustry}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-white/70 text-sm">
                <MapPin size={14} /><span>{location}</span>
                <span className="text-white/30">·</span>
                <span>{BUDGET_LABELS[a.budget_range] ?? a.budget_range}</span>
                <span className="text-white/30">·</span>
                <span>{GOAL_LABELS[a.primary_goal] ?? a.primary_goal}</span>
              </div>
            </div>
            {!isPaid && (
              <div className="bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 rounded-xl px-5 py-4 text-sm max-w-xs">
                <div className="font-bold text-[var(--color-gold)] mb-1">🔓 Preview Mode</div>
                <p className="text-white/70 text-xs leading-relaxed">
                  You&apos;re seeing a summary. Unlock the full report including all demographics, competition map, and PDF download.
                </p>
                <Link href="/sign-up?plan=monthly" className="inline-block mt-3 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-[var(--color-gold-light)] transition-colors">
                  Unlock for $29/mo →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Feasibility Score — first thing after the header */}
        {feasibilityScore && (
          <FeasibilitySection
            score={feasibilityScore}
            isPaid={isPaid}
            analysisId={a.id}
          />
        )}

        {/* Comparable Cities — paid only, requires census data */}
        {isPaid && comparableCities && comparableCities.length >= 3 && censusData && (
          <ComparableCitiesSection
            cities={comparableCities}
            industry={industry}
            userCity={{
              name: a.preferred_city,
              median_household_income: (() => { const n = parseFloat((censusData.medianHouseholdIncome ?? '').replace(/[^0-9.]/g, '')); return isNaN(n) || n <= 0 ? null : n })(),
              median_age:              (() => { const n = parseFloat((censusData.medianAge ?? '').replace(/[^0-9.]/g, ''));              return isNaN(n) || n <= 0 ? null : n })(),
              unemployment_rate:       (() => { const n = parseFloat((censusData.unemploymentRate ?? '').replace(/[^0-9.]/g, ''));       return isNaN(n) || n <= 0 ? null : n })(),
              median_rent:             (() => { const n = parseFloat((censusData.medianRent ?? '').replace(/[^0-9.]/g, ''));             return isNaN(n) || n <= 0 ? null : n })(),
              bachelor_degree_pct:     (() => {
                const bachelors = parseFloat((censusData.bachelorsDegreeCount ?? '').replace(/[^0-9.]/g, ''))
                const pop       = parseFloat((censusData.population ?? '').replace(/[^0-9.]/g, ''))
                if (isNaN(bachelors) || isNaN(pop) || pop <= 0) return null
                return parseFloat(((bachelors / pop) * 100).toFixed(2))
              })(),
              renter_pct: null,
            }}
          />
        )}

        {/* FREE: Teaser — 1 BLS stat */}
        <DataSection icon={TrendingUp} title="Industry Snapshot" badge="BLS Data">
          {blsData && !blsData.error ? (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-slate)] font-medium uppercase tracking-wider">Sector: {blsData.sectorLabel}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <StatCard label="National Unemployment Rate" value={blsData.nationalUnemploymentRate} color="text-[var(--color-emerald)]" />
                <StatCard label="Employment Trend (1yr)" value={blsData.employmentTrend ?? 'N/A'}
                  color={blsData.employmentTrend?.startsWith('+') ? "text-[var(--color-emerald)]" : "text-red-500"} />
              </div>
              {!isPaid && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                  <Lock size={13} className="shrink-0" />
                  <span>Full industry breakdown — total employment, hourly wages, weekly hours — unlocked with subscription.</span>
                </div>
              )}
              {isPaid && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <StatCard label="Total Sector Employment" value={blsData.latestEmployment} color="text-[var(--color-navy)]" />
                  <StatCard label="Avg Hourly Earnings" value={blsData.avgHourlyEarnings} color="text-[var(--color-blue)]" />
                  <StatCard label="Avg Weekly Hours" value={blsData.avgWeeklyHours} color="text-[var(--color-navy)]" />
                </div>
              )}
            </div>
          ) : blsData?.error ? (
            <ErrorData message="Could not load BLS data." />
          ) : (
            <PendingData source="BLS — select an industry to see data" />
          )}
        </DataSection>

        {/* FREE: 1 Census stat */}
        <DataSection icon={Users} title="Market Snapshot" badge="Census Data">
          {censusData && !censusData.error ? (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-slate)] font-medium uppercase tracking-wider">{censusData.areaName} — ACS 5-Year Estimates</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <StatCard label="Total Population" value={censusData.population} color="text-[var(--color-navy)]" />
                <StatCard label="Median Household Income" value={censusData.medianHouseholdIncome} color="text-[var(--color-emerald)]" />
              </div>
              {!isPaid && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                  <Lock size={13} className="shrink-0" />
                  <span>Full demographics — median age, rent, unemployment, education — unlocked with subscription.</span>
                </div>
              )}
              {isPaid && (
                <div className="grid sm:grid-cols-3 gap-3">
                  <StatCard label="Median Age" value={`${censusData.medianAge} yrs`} color="text-[var(--color-blue)]" />
                  <StatCard label="Unemployment Rate" value={censusData.unemploymentRate} color="text-amber-500" />
                  <StatCard label="Median Monthly Rent" value={censusData.medianRent} color="text-[var(--color-navy)]" />
                  <StatCard label="College-Educated" value={censusData.bachelorsDegreeCount} color="text-[var(--color-blue)]" />
                </div>
              )}
            </div>
          ) : censusData?.error ? (
            <ErrorData message="Could not load Census data." />
          ) : (
            <PendingData source="Census Bureau — select a state to see data" />
          )}
        </DataSection>

        {/* LOCKED sections for free users */}
        {!isPaid ? (
          <>
            <LockedSection
              title="Competition Map"
              description="See competitor locations, NAICS codes, ratings, and market gaps within your target radius."
            />
            <LockedSection
              title="Full Labor Market Analysis"
              description="Wage data, job openings, hiring trends, and workforce availability for your sector."
            />
            <LockedSection
              title="Financing Options"
              description="Matched SBA loans, grants, and funding sources based on your budget and business type."
            />
            <LockedSection
              title="Complete Next Steps Guide"
              description="6-step personalized action plan to go from analysis to open doors."
            />

            {/* Upgrade CTA */}
            <div className="bg-[var(--color-navy)] rounded-2xl p-8 text-center text-white">
              <div className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Unlock Everything</div>
              <h2 className="text-2xl font-extrabold mb-2">Get the Full Picture</h2>
              <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
                Competition map, complete demographics, labor market data, financing options, PDF download, and your personalized action plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/sign-up?plan=monthly"
                  className="bg-[var(--color-gold)] text-[var(--color-navy)] font-bold px-8 py-3 rounded-xl text-sm hover:bg-[var(--color-gold-light)] transition-colors">
                  Subscribe — $29/month
                </Link>
                <Link href="/sign-up?plan=annual"
                  className="bg-white/10 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-white/20 transition-colors border border-white/20">
                  Annual — $249/year (save 3 months)
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PAID: Competition Map */}
            <DataSection icon={MapPin} title="Competition Map" badge="Google Maps">
              <div className="bg-[var(--color-muted)] rounded-2xl overflow-hidden">
                <div className="px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-[var(--color-navy)] text-white rounded-2xl p-5 shrink-0">
                    <MapPin size={32} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="font-bold text-[var(--color-navy)] text-base mb-1">Explore Competitors on the Map</h4>
                    <p className="text-sm text-[var(--color-slate)] max-w-sm">
                      See nearby competitors, adjust your radius, and view live demographics for any location in {a.preferred_city ?? a.preferred_state ?? 'your area'}.
                    </p>
                    <Link
                      href={`/dashboard/map?city=${encodeURIComponent(a.preferred_city ?? '')}&state=${encodeURIComponent(a.preferred_state ?? '')}&industry=${encodeURIComponent(industry)}`}
                      className="inline-flex items-center gap-2 mt-4 bg-[var(--color-navy)] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[var(--color-navy-light)] transition-colors"
                    >
                      <MapPin size={14} /> Open Interactive Map
                    </Link>
                  </div>
                </div>
              </div>
            </DataSection>

            {/* PAID: Labor Market */}
            <DataSection icon={BarChart2} title="Labor Market" badge="BLS Live Data">
              {blsData && !blsData.error ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  <StatCard label="National Unemployment" value={blsData.nationalUnemploymentRate} color="text-[var(--color-emerald)]" />
                  <StatCard label="Avg Hourly Earnings" value={blsData.avgHourlyEarnings} color="text-[var(--color-navy)]" />
                </div>
              ) : <PendingData source="Bureau of Labor Statistics" />}
            </DataSection>

            {/* PAID: Financing */}
            <DataSection icon={DollarSign} title="Financing Options" badge="SBA">
              <div className="space-y-2">
                {[
                  {
                    name: "SBA 7(a) Loan",
                    desc: "Up to $5M — general business purposes",
                    note: "Best for businesses needing working capital, equipment, or expansion funding",
                    badge: "Best Match",
                    show: true,
                  },
                  {
                    name: "SBA Microloan",
                    desc: "Up to $50,000 — ideal for startups",
                    note: "Best for first-time business owners with limited credit history or small capital needs",
                    badge: "",
                    show: true,
                  },
                  {
                    name: "USDA Business Loan",
                    desc: "Rural area financing",
                    note: "Best for businesses in rural areas or agriculture-related industries",
                    badge: "",
                    show: !a.preferred_city || a.industry_preference === "Agriculture",
                  },
                ].filter(o => o.show).map(({ name, desc, note, badge }) => (
                  <div key={name} className="flex items-start justify-between px-4 py-3 bg-[var(--color-muted)] rounded-xl gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-navy)]">{name}</div>
                      <div className="text-xs text-[var(--color-slate)]">{desc}</div>
                      <div className="text-xs text-[var(--color-slate)] mt-1 italic">{note}</div>
                    </div>
                    {badge && <span className="text-xs font-bold bg-[var(--color-emerald)] text-white px-2.5 py-1 rounded-full shrink-0">{badge}</span>}
                  </div>
                ))}
                <PendingData source="SBA.gov API" />
              </div>
            </DataSection>
          </>
        )}

        {/* Always visible: questionnaire summary */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
          <h3 className="font-bold text-[var(--color-navy)] mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-[var(--color-emerald)]" /> Your Questionnaire Summary
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Type", a.entrepreneur_type === "new" ? "Aspiring Entrepreneur" : "Expanding Business"],
              ["Industry", displayIndustry],
              ["Location", location],
              ["Budget", BUDGET_LABELS[a.budget_range] ?? a.budget_range],
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
