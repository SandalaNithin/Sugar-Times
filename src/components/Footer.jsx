import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Landmark } from "lucide-react";
import { CATEGORY_TREE, categoryHref } from "@/lib/categories";

const socials = [
  { name: "Facebook", href: "https://www.facebook.com/TheSugarTimes/", hoverBg: "hover:bg-[#1877F2]" },
  { name: "LinkedIn", href: "https://in.linkedin.com/company/sugar-times-magazine", hoverBg: "hover:bg-[#0A66C2]" },
  { name: "Twitter/X", href: "https://x.com/SugarTimes", hoverBg: "hover:bg-slate-600" },
  { name: "YouTube", href: "https://www.youtube.com/@sugartimesmagazine2346", hoverBg: "hover:bg-red-600" },
  { name: "WhatsApp", href: "https://wa.link/z0zpax", hoverBg: "hover:bg-[#25D366]" },
];

const quickLinks = [
  { label: "Home", href: "/", emoji: "\u{1F3E0}" },
  { label: "About Us", href: "/about", emoji: "\u{1F4D8}" },
  { label: "E-Magazine", href: "/magazines", emoji: "\u{1F4D6}" },
  { label: "Subscribe", href: "/subscription", emoji: "\u{1F4E6}" },
  { label: "Renewal", href: "/renewal", emoji: "\u{1F504}" },
  { label: "Advertise With Us", href: "/advertise", emoji: "\u{1F4E3}" },
  { label: "Contact Us", href: "/contact", emoji: "\u260E\uFE0F" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 font-sans">

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div>
          <Link href="/" className="inline-block mb-4 transition-opacity hover:opacity-90">
            <Image
              src="/sugar times main logo.png"
              alt="Sugar Times"
              width={180}
              height={70}
              className="h-14 w-auto object-contain bg-white rounded-lg p-2 shadow-lg"
            />
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            India&apos;s only monthly Hindi news magazine for the sugar industry &amp; cane farmers. Published from Prayagraj since 2016.
          </p>
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md bg-slate-800 text-slate-300 ${s.hoverBg} hover:text-white transition-all`}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map(({ label, href, emoji }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* News Categories */}
        <div>
          <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">News Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {CATEGORY_TREE.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={categoryHref(cat.label)}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/videos"
                className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                <span>🎥</span>
                <span>Videos</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400 leading-snug">485, Mumfordganj, Prayagraj – 211002</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-emerald-400 shrink-0" />
              <a href="tel:05322440267" className="text-slate-400 hover:text-emerald-400 transition-colors">0532-2440267</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-emerald-400 shrink-0" />
              <a href="tel:+917355453462" className="text-slate-400 hover:text-emerald-400 transition-colors">+91 7355453462</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-emerald-400 shrink-0" />
              <a href="mailto:info@sugartimes.co.in" className="text-slate-400 hover:text-emerald-400 transition-colors break-all">info@sugartimes.co.in</a>
            </li>
          </ul>

          {/* Bank Details */}
          <div className="mt-5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Landmark size={14} className="text-emerald-400" />
              <span className="text-white text-[11px] font-black uppercase tracking-widest">UCO Bank, Mumfordganj</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <div>A/C: 16110210000861</div>
              <div>IFSC: UCBA0001611</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Sugar Times Magazine. All rights reserved. | Published from Prayagraj, UP
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms &amp; Conditions</Link>
            <Link href="/sitemap" className="hover:text-emerald-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
