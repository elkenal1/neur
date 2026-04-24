export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, MapPin, FileText, ArrowRight, Plus, TrendingUp } from "lucide-react";

const PLAN_LABELS: Record<string, { label: string; cls: string }> = {
  free:       { label: 'Free Plan',    cls: 'bg-gray-100 text-gray-500' },
  monthly:    { label: 'Pro Monthly',  cls: 'bg-blue-50 text-blue-700' },
  annual:     { label: 'Pro Annual',   cls: 'bg-emerald-50 text-emerald-700' },
  consultant: { label: 'Consultant',   cls: 'bg-purple-50 text-purple-700' },
  admin:      { label: 'Admin',        cls: 'bg-red-50 text-red-600' },
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const name = user.user_metadata?.full_name?.split(" ")[0] || "there";

  const [{ data: analyses }, { data: profile }] = await Promise.all([
    supabase
      .from("analyses")
      .select("id, created_at, industry_preference, industry_open_to_suggestions, preferred_state, preferred_city")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single(),
  ]);

  const plan = profile?.plan ?? 'free'
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.free
  const isPaid = ['monthly', 'annual', 'consultant', 'admin'].includes(plan)

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Welcome banner */}
      <div
        className="grain rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #06061a 0%, #12126B 60%, #1a1a8a 100%)' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                Welcome back, {name}
              </h1>
              <p className="text-white/60 text-sm mt-1.5">
                {analyses && analyses.length > 0
                  ? `You have ${analyses.length} analysis${analyses.length > 1 ? 'es' : ''} — pick up where you left off.`
                  : "Ready to find your next opportunity? Start your first analysis."}
              </p>
            </div>
            <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full ${planMeta.cls}`}>
              {planMeta.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
            >
              <Plus size={15} /> New Analysis
            </Link>
            {analyses && analyses.length > 0 && (
              <Link
                href="/dashboard/reports"
                className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <FileText size={15} /> My Reports
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: ClipboardList,
            title: 'New Analysis',
            desc: 'Answer a few questions and get your personalized feasibility report.',
            href: '/questionnaire',
            accent: 'var(--color-navy)',
            iconColor: 'var(--color-gold)',
          },
          {
            icon: MapPin,
            title: 'Location Map',
            desc: 'Explore the US market. See demographics and competitors by city.',
            href: '/dashboard/map',
            accent: 'var(--color-blue)',
            iconColor: 'var(--color-blue)',
          },
          {
            icon: TrendingUp,
            title: 'My Reports',
            desc: 'Review your past analyses, scores, and action plans.',
            href: '/dashboard/reports',
            accent: 'var(--color-emerald)',
            iconColor: 'var(--color-emerald)',
          },
        ].map(({ icon: Icon, title, desc, href, accent, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: accent }}
            >
              <Icon size={18} style={{ color: iconColor === accent ? 'white' : iconColor }} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-navy)] text-sm mb-1">{title}</h3>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">{desc}</p>
            </div>
            <div className="mt-auto flex items-center gap-1 text-xs font-semibold" style={{ color: accent }}>
              Open <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Upgrade nudge — free users only */}
      {!isPaid && (
        <div
          className="rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-gold)] shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="font-bold text-[var(--color-navy)] text-sm">Unlock your full feasibility score</div>
              <div className="text-xs text-[var(--color-slate)] mt-0.5">Competition map, full demographics, PDF downloads, and personalized action plan.</div>
            </div>
          </div>
          <Link
            href="/sign-up?plan=monthly"
            className="shrink-0 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
          >
            Upgrade — $29/mo
          </Link>
        </div>
      )}

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--color-navy)]">Recent Reports</h2>
          {analyses && analyses.length > 0 && (
            <Link href="/dashboard/reports" className="text-sm text-[var(--color-slate)] hover:text-[var(--color-navy)] transition-colors">
              View all →
            </Link>
          )}
        </div>

        {!analyses || analyses.length === 0 ? (
          <div
            className="bg-white rounded-2xl border border-[var(--color-border)] p-12 text-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"
              style={{ background: 'var(--color-navy)' }}
            >
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-[var(--color-navy)] text-base mb-2">No analyses yet</h3>
            <p className="text-[var(--color-slate)] text-sm mb-5 max-w-xs mx-auto">
              Start your first analysis to get personalized business and location recommendations.
            </p>
            <Link
              href="/questionnaire"
              className="inline-block font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              style={{ background: 'var(--color-navy)', color: 'white' }}
            >
              Start Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {analyses.map((a) => {
              const industry = a.industry_open_to_suggestions ? "AI Suggested Match" : (a.industry_preference ?? "Unknown Industry");
              const location = [a.preferred_city, a.preferred_state].filter(Boolean).join(", ") || "Remote / Online";
              const date = new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <Link
                  key={a.id}
                  href={`/dashboard/reports/${a.id}`}
                  className="group flex items-center justify-between bg-white rounded-2xl border border-[var(--color-border)] px-5 py-4 hover:shadow-md transition-all duration-200"
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--color-navy)] text-white rounded-xl p-2.5 shrink-0">
                      <FileText size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-navy)] text-sm">{industry}</div>
                      <div className="text-xs text-[var(--color-slate)] mt-0.5">{location} · {date}</div>
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-[var(--color-slate)] group-hover:text-[var(--color-navy)] group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
            <Link
              href="/questionnaire"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--color-border)] rounded-2xl px-6 py-4 text-sm font-semibold text-[var(--color-slate)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] transition-colors"
            >
              <Plus size={15} /> Start a New Analysis
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
