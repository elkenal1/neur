"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push(redirect);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8 max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/neurlogo.png" alt="Neur" width={28} height={28} className="object-contain" />
            <span className="text-lg font-bold text-[var(--color-navy)] tracking-tight">NEUR</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">Welcome back</h1>
          <p className="text-sm text-[var(--color-slate)] mt-1">Sign in to your Neur account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[var(--color-foreground)]">Password</label>
              <Link href="/forgot-password" className="text-xs text-[var(--color-blue)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-navy)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-slate)] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[var(--color-blue)] font-semibold hover:underline">
            Get started free
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
