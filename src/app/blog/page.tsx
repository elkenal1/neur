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
      <main className="pt-16 min-h-screen" style={{ background: '#F7F4EF' }}>

        <section
          className="grain text-white py-24 px-6"
          style={{ background: 'linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-4">Resources</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Blog &amp; Guides</h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Practical articles to help you launch, grow, and run your business smarter.
            </p>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
              style={{ background: 'var(--color-navy)' }}
            >
              ✍️
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--color-navy)] mb-3">Articles coming soon</h2>
            <p className="text-[var(--color-slate)] mb-8 leading-relaxed max-w-md mx-auto">
              We&apos;re working on guides covering business formation, market research, financing, and more.
              Check back shortly — or get started with your free analysis now.
            </p>
            <Link
              href="/sign-up"
              className="inline-block font-bold px-8 py-3 rounded-xl transition-colors"
              style={{ background: 'var(--color-navy)', color: 'white' }}
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
