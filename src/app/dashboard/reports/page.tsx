import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, ArrowRight } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, created_at, industry_preference, industry_open_to_suggestions, preferred_state, preferred_city, status, budget_range")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">My Reports</h1>
            <p className="text-sm text-[var(--color-slate)] mt-1">All your business analyses in one place</p>
          </div>
          <Link
            href="/questionnaire"
            className="flex items-center gap-2 bg-[var(--color-navy)] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[var(--color-navy-light)] transition-colors"
          >
            <Plus size={16} /> New Analysis
          </Link>
        </div>

        {!analyses || analyses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <FileText size={40} className="mx-auto mb-3 text-[var(--color-border)]" />
            <h3 className="font-bold text-[var(--color-navy)] text-lg mb-1">No reports yet</h3>
            <p className="text-[var(--color-slate)] text-sm mb-5">Complete the questionnaire to generate your first analysis.</p>
            <Link href="/questionnaire" className="inline-block bg-[var(--color-navy)] text-white font-bold px-6 py-3 rounded-xl text-sm">
              Start Analysis
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
                  className="flex items-center justify-between bg-white rounded-2xl border border-[var(--color-border)] px-6 py-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--color-navy)] text-white rounded-xl p-2.5">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-navy)]">{industry}</div>
                      <div className="text-sm text-[var(--color-slate)] mt-0.5">{location} · {date}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[var(--color-slate)] group-hover:text-[var(--color-navy)] transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
