export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutDashboard, ClipboardList, MapPin, FileText, ArrowRight, Plus } from "lucide-react";

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
    <div className="min-h-screen bg-[var(--color-background)] flex">

      {/* Sidebar */}
      <aside className="w-60 bg-[var(--color-navy)] text-white flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/neurlogo.png" alt="Neur" width={26} height={26} className="object-contain invert" />
            <span className="text-base font-bold tracking-tight">NEUR</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white font-medium">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/questionnaire" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <ClipboardList size={16} /> New Analysis
          </Link>
          <Link href="/dashboard/map" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <MapPin size={16} /> Location Map
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <FileText size={16} /> My Reports
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <form action="/auth/sign-out" method="post">
            <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8">
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
      </main>
    </div>
  );
}
