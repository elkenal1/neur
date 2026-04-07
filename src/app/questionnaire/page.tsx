"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import StepBackground from "@/components/questionnaire/StepBackground";
import StepIndustry from "@/components/questionnaire/StepIndustry";
import StepLocation from "@/components/questionnaire/StepLocation";
import StepBudget from "@/components/questionnaire/StepBudget";
import StepCustomer from "@/components/questionnaire/StepCustomer";
import StepGoals from "@/components/questionnaire/StepGoals";

const STEPS = [
  { label: "Background" },
  { label: "Industry" },
  { label: "Location" },
  { label: "Budget" },
  { label: "Customer" },
  { label: "Goals" },
];

export default function Questionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/sign-in?redirect=/questionnaire");
      return;
    }

    const { data: analysis, error: insertError } = await supabase
      .from("analyses")
      .insert({ ...data, user_id: user.id, status: "pending" })
      .select("id")
      .single();

    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong. Please try again.");
    } else {
      router.push(`/dashboard/reports/${analysis.id}`);
    }
  }

  const stepComponents = [
    <StepBackground key="bg" data={data} onChange={handleChange} />,
    <StepIndustry key="ind" data={data} onChange={handleChange} />,
    <StepLocation key="loc" data={data} onChange={handleChange} />,
    <StepBudget key="bud" data={data} onChange={handleChange} />,
    <StepCustomer key="cust" data={data} onChange={handleChange} />,
    <StepGoals key="goals" data={data} onChange={handleChange} />,
  ];

  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--color-border)] px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/neurlogo.png" alt="Neur" width={24} height={24} className="object-contain" />
          <span className="text-sm font-bold text-[var(--color-navy)] tracking-tight">NEUR</span>
        </Link>
        <span className="text-xs text-[var(--color-slate)] font-medium">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 z-40 h-1 bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-navy)] transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="pt-24 pb-4 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? "bg-[var(--color-emerald)] text-white"
                      : i === step
                      ? "bg-[var(--color-navy)] text-white"
                      : "bg-[var(--color-border)] text-[var(--color-slate)]"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${i === step ? "text-[var(--color-navy)]" : "text-[var(--color-slate)]"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8 min-h-[420px]">
            {stepComponents[step]}
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-slate)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-sm hover:bg-[var(--color-gold-light)] disabled:opacity-60 transition-all shadow-md"
              >
                {submitting ? "Submitting..." : "Get My Analysis ✨"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-navy)] text-white font-bold text-sm hover:bg-[var(--color-navy-light)] transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
