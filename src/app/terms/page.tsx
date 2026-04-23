import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Terms of Service — Neur' }

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[var(--color-background)]">
        <section className="py-16 px-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[var(--color-navy)] mb-4">Terms of Service</h1>
          <p className="text-[var(--color-slate)] text-sm mb-8">Last updated: coming soon</p>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-bold text-[var(--color-navy)] mb-2">Terms of Service Coming Soon</h2>
            <p className="text-[var(--color-slate)] text-sm">
              Our full terms of service will be published here shortly. If you have any questions in the meantime, please contact us at <a href="mailto:hello@neur.co" className="text-[var(--color-blue)] hover:underline">hello@neur.co</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
