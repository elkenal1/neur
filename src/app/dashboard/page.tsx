export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, MapPin, FileText, ArrowRight, Plus } from "lucide-react";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const name = user.user_metadata?.full_name?.split(" ")[0] || "there";

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, created_at, industry_preference, industry_open_to_suggestions, preferred_state, preferred_city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8">
        <div className="max-w-4xl mx-auto">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">
              Welcome back, {name} 👋
            </h1>
            <p className="text-[var(--color-slate)] mt-1 text-sm">
              Ready to find your next opportunity? Start a new analysis or browse your reports.
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <Link href="/questionnaire" className="bg-[var(--color-navy)] text-white rounded-2xl p-6 hover:bg-[var(--color-navy-light)] transition-colors">
              <ClipboardList size={24} className="mb-3 text-[var(--color-gold)]" />
              <h3 className="font-bold text-base">New Analysis</h3>
              <p className="text-white/60 text-sm mt-1">Tell us your goals and get matched</p>
            </Link>
            <Link href="/dashboard/map" className="bg-white border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-md transition-shadow">
              <MapPin size={24} className="mb-3 text-[var(--color-blue)]" />
              <h3 className="font-bold text-base text-[var(--color-navy)]">Browse Locations</h3>
              <p className="text-[var(--color-slate)] text-sm mt-1">Explore the US market map</p>
            </Link>
            <Link href="/dashboard/reports" className="bg-white border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-md transition-shadow">
              <FileText size={24} className="mb-3 text-[var(--color-emerald)]" />
              <h3 className="font-bold text-base text-[var(--color-navy)]">My Reports</h3>
              <p className="text-[var(--color-slate)] text-sm mt-1">View and download your analyses</p>
            </Link>
          </div>

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
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-10 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-[var(--color-navy)] text-lg mb-1">No analyses yet</h3>
                <p className="text-[var(--color-slate)] text-sm mb-5">
                  Start your first analysis to get personalized business and location recommendations.
                </p>
                <Link
                  href="/questionnaire"
                  className="inline-block bg-[var(--color-navy)] text-white font-bold px-6 py-3 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors text-sm"
                >
                  Start Your First Analysis
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((a) => {
                  const industry = a.industry_open_to_suggestions ? "AI Suggested Match" : (a.industry_preference ?? "Unknown Industry");
                  const location = [a.preferred_city, a.preferred_state].filter(Boolean).join(", ") || "Remote / Online";
                  const date = new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <Link
                      key={a.id}
                      href={`/dashboard/reports/${a.id}`}
                      className="flex items-center justify-between bg-white rounded-2xl border border-[var(--color-border)] px-6 py-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[var(--color-navy)] text-white rounded-xl p-2.5">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--color-navy)] text-sm">{industry}</div>
                          <div className="text-xs text-[var(--color-slate)] mt-0.5">{location} · {date}</div>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-[var(--color-slate)] group-hover:text-[var(--color-navy)] transition-colors" />
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
    </div>
  );
}
