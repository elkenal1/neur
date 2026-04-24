import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Terms of Service — Neur' }

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen" style={{ background: '#F7F4EF' }}>

        <section
          className="grain text-white py-20 px-6"
          style={{ background: 'linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-4">Legal</p>
            <h1 className="text-4xl font-extrabold mb-3">Terms of Service</h1>
            <p className="text-white/50 text-sm">Last updated: coming soon</p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div
              className="bg-white rounded-2xl border border-[var(--color-border)] p-10 text-center"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
                style={{ background: '#F0EDE8' }}
              >
                📋
              </div>
              <h2 className="text-lg font-bold text-[var(--color-navy)] mb-2">Terms of Service Coming Soon</h2>
              <p className="text-[var(--color-slate)] text-sm leading-relaxed">
                Our full terms of service will be published here shortly. If you have any questions in the meantime,
                please contact us at{' '}
                <a href="mailto:hello@neur.co" className="text-[var(--color-gold)] font-semibold hover:underline">
                  hello@neur.co
                </a>.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
