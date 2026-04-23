import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contact — Neur',
  description: "Have a question or feedback? We'd love to hear from you.",
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[var(--color-background)]">

        <section className="bg-[var(--color-navy)] text-white py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-4">Get in Touch</p>
            <h1 className="text-4xl font-extrabold mb-4">We&apos;re here to help</h1>
            <p className="text-white/70 text-lg">
              Have a question, issue, or feedback? Send us a message and we&apos;ll respond within 24 hours.
            </p>
          </div>
        </section>

        <ContactForm />

      </main>
      <Footer />
    </>
  )
}
