import Link from "next/link";
import Image from "next/image";
import { 
  Map as MapIcon, 
  Globe, 
  Search, 
  ArrowLeft,
  ChevronRight,
  Home,
  BookOpen,
  Newspaper,
  ShieldCheck,
  Mail,
  ExternalLink
} from "lucide-react";
import { CATEGORY_TREE, categoryHref } from "@/lib/categories";

export const metadata = {
  title: "Sitemap & Location | Sugar Times",
  description: "Navigate through Sugar Times content and find our physical location in Prayagraj.",
};

export default function SitemapPage() {
  const sitemapData = [
    {
      title: "Main Explorer",
      icon: Home,
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "E-Magazine", href: "/magazines" },
        { label: "Pricing & Plans", href: "/subscription" },
        { label: "Account Login", href: "/login" },
      ]
    },
    {
      title: "News Categories",
      icon: Newspaper,
      links: CATEGORY_TREE.map(cat => ({ label: cat.label, href: categoryHref(cat.label) }))
    },
    {
      title: "Legal & Policies",
      icon: ShieldCheck,
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Sugar Industry Policies", href: "/policy" },
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* ── HEADER HERO ────────────────────────────────────────── */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="/sugar times magazine.jpg"
          alt="Sugar Times Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-[4px]" />
        
        <div className="relative z-10 text-center px-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-widest text-[11px]"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Sitemap & Location
          </h1>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full" />
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
            Explore our site structure and find us on the map. We are located in the heart of Prayagraj.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* ── MAP SECTION ───────────────────────────────────────── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <MapIcon size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Our Location</h2>
              <p className="text-sm text-slate-500 font-medium">Find us in Mumfordganj, Prayagraj</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden group">
            <div className="relative rounded-[32px] overflow-hidden aspect-video lg:aspect-[21/9]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13919.750732464314!2d81.849069!3d25.475809!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca8f1ede9ec5%3A0xe6180b8bd9e6320a!2sSugar%20Times%20Magazine!5e1!3m2!1sen!2sin!4v1776843356017!5m2!1sen!2sin" 
                className="absolute inset-0 w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="text-emerald-500"><Globe size={20} /></div>
                <div>
                   <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Address</h4>
                   <p className="text-sm text-slate-700 font-bold">485, Mumfordganj, Prayagraj</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="text-emerald-500"><Mail size={20} /></div>
                <div>
                   <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Business Email</h4>
                   <p className="text-sm text-slate-700 font-bold">info@sugartimes.co.in</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="text-emerald-500"><ExternalLink size={20} /></div>
                <div>
                   <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Digital Portal</h4>
                   <p className="text-sm text-slate-700 font-bold">www.sugartimes.co.in</p>
                </div>
             </div>
          </div>
        </div>

        {/* ── SITEMAP LINKS SECTION ─────────────────────────────── */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Search size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Explore Content</h2>
              <p className="text-sm text-slate-500 font-medium">Quick navigation to all sections</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {sitemapData.map((group, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b-2 border-slate-100">
                   <group.icon size={18} className="text-emerald-500" />
                   <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">{group.title}</h3>
                </div>
                <ul className="space-y-3">
                  {group.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        href={link.href} 
                        className="text-slate-500 hover:text-emerald-600 transition-colors flex items-center justify-between group py-1"
                      >
                         <span className="text-sm font-semibold">{link.label}</span>
                         <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── FOOTER NOTICE ────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 leading-relaxed">
               Registered Office: H.485, Mumfordganj, Prayagraj- 211002 (U.P)
            </p>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[11px] hover:text-emerald-700 transition-colors">
              Return to Home Feed <ChevronRight size={14} />
            </Link>
        </div>
      </div>
    </div>
  );
}
