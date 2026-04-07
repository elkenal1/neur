import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-navy)] text-white/60 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/neurlogo.png" alt="Neur" width={28} height={28} className="object-contain invert" />
              <span className="text-white text-lg font-bold tracking-tight">NEUR</span>
            </div>
            <p className="text-sm leading-relaxed">
              Business intelligence for entrepreneurs — powered by real US market data.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Consultants</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Business Guides</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Financing Options</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Market Data</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} Neur. All rights reserved.</p>
          <p>Built for entrepreneurs across the United States.</p>
        </div>
      </div>
    </footer>
  );
}
