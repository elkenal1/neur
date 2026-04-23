import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Privacy Policy — Neur' }

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[var(--color-background)]">
        <section className="py-16 px-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[var(--color-navy)] mb-4">Privacy Policy</h1>
          <p className="text-[var(--color-slate)] text-sm mb-8">Last updated: coming soon</p>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-lg font-bold text-[var(--color-navy)] mb-2">Privacy Policy Coming Soon</h2>
            <p className="text-[var(--color-slate)] text-sm">
              Our full privacy policy will be published here shortly. If you have any questions in the meantime, please contact us at <a href="mailto:hello@neur.co" className="text-[var(--color-blue)] hover:underline">hello@neur.co</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
