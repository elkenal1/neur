"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-[var(--color-navy)] mb-2">Check your email</h2>
          <p className="text-[var(--color-slate)] text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">Create your account</h1>
          <p className="text-sm text-[var(--color-slate)] mt-1">Start finding your perfect business opportunity</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
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
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-slate)] mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--color-blue)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
