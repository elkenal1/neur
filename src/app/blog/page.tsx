import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Blog & Guides — Neur',
  description: 'Articles, guides, and insights for entrepreneurs.',
}

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[var(--color-background)]">
        <section className="bg-[var(--color-navy)] text-white py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-4">Resources</p>
            <h1 className="text-4xl font-extrabold mb-4">Blog &amp; Guides</h1>
            <p className="text-white/70 text-lg">
              Practical articles to help you launch, grow, and run your business smarter.
            </p>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">✍️</div>
            <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-3">Articles coming soon</h2>
            <p className="text-[var(--color-slate)] mb-8 leading-relaxed">
              We&apos;re working on guides covering business formation, market research, financing, and more. Check back shortly — or get started with your free analysis now.
            </p>
            <Link
              href="/sign-up"
              className="inline-block bg-[var(--color-navy)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Start Your Free Analysis
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
