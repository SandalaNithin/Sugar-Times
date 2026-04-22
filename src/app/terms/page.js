import Link from "next/link";
import Image from "next/image";
import { 
  FileText, 
  Globe, 
  ShieldAlert, 
  Users, 
  Scale, 
  AlertTriangle, 
  ArrowLeft,
  ChevronRight,
  Mail,
  ShieldCheck,
  Lock,
  Copy
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Sugar Times",
  description: "Terms and conditions governing the use of the Sugar Times website and services.",
};

const sections = [
  { id: "intro", title: "Introduction", icon: FileText },
  { id: "use-of-content", title: "Use of Content", icon: Copy },
  { id: "acceptable-use", title: "Acceptable Use", icon: Globe },
  { id: "security-rules", title: "Security Rules", icon: Lock },
  { id: "indemnity", title: "Indemnity", icon: ShieldCheck },
  { id: "liability", title: "Liability", icon: Scale },
  { id: "disclaimer", title: "Disclaimer", icon: AlertTriangle },
];

export default function TermsConditionsPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
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
            Terms & Conditions
          </h1>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full" />
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
            Please read these terms carefully. By using our website, you agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ── QUICK NAV SIDEBAR ────────────────────────────────── */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 px-2">Table of Contents</h4>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a 
                      key={s.id} 
                      href={`#${s.id}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all group"
                    >
                      <s.icon size={16} className="text-slate-400 group-hover:text-emerald-500" />
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
              
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg">
                <h4 className="text-lg font-black mb-2">Legal Help?</h4>
                <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
                  Have questions about these terms or your user rights?
                </p>
                <Link 
                  href="/contact" 
                  className="block text-center py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold transition-all"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* ── ARTICLE CONTENT ──────────────────────────────────── */}
          <main className="flex-1 space-y-16">
            
            {/* Introduction */}
            <section id="intro" className="scroll-mt-28">
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm leading-relaxed">
                <div className="prose prose-slate max-w-none">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Introduction</h2>
                  </div>
                  <p className="text-slate-600 font-medium italic mb-6">
                    The terms “We” / “Us” / “Our”/”Company” individually and collectively refer to Sugar Times and the terms “Visitor” ”User” refer to the users.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    This page states the Terms and Conditions under which you (Visitor) may visit this website (“Sugartimes.co.in”). Please read this page carefully. If you do not accept the Terms and Conditions stated here, we would request you to exit this site.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    The business, any of its business divisions and / or its subsidiaries, associate companies or subsidiaries to subsidiaries or such other investment companies reserve their respective rights to revise these Terms and Conditions at any time by updating this posting. You should visit this page periodically to re-appraise yourself of the Terms and Conditions.
                  </p>
                </div>
              </div>
            </section>

            {/* Use of Content */}
            <section id="use-of-content" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Copy size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Use of Content</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  All logos, brands, marks headings, labels, names, signatures, numerals, shapes or any combinations thereof, appearing in this site, except as otherwise noted, are properties either owned, or used under licence, by the business and / or its associate entities who feature on this Website.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-3xl">
                  <p className="text-sm text-amber-900 font-medium">
                    The use of these properties or any other content on this site, except as provided in these terms and conditions or in the site content, is strictly prohibited.
                  </p>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  You may not sell or modify the content of this Website or reproduce, display, publicly perform, distribute, or otherwise use the materials in any way for any public or commercial purpose without the respective organisation&apos;s or entity&apos;s written permission.
                </p>
              </div>
            </section>

            {/* Acceptable Website Use */}
            <section id="acceptable-use" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <Globe size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Acceptable Website Use</h2>
              </div>
              
              {/* General Rules Subcard */}
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm mb-8">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                   General Rules
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Visitors may not use the Web Site in order to transmit, distribute, store or destroy material:
                </p>
                <ul className="space-y-4">
                  {[
                    "That could constitute or encourage conduct that would be considered a criminal offence or violate any applicable law or regulation.",
                    "In a manner that will infringe the copyright, trademark, trade secret or other intellectual property rights of others.",
                    "That is libellous, defamatory, pornographic, profane, obscene, threatening, abusive or hateful."
                  ].map((rule, i) => (
                    <li key={i} className="flex gap-4 items-start text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <ChevronRight size={14} />
                      </div>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security Rules Subcard */}
              <div id="security-rules" className="scroll-mt-28 bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-emerald-400">
                    <Lock size={20} /> Security Rules
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Visitors are prohibited from violating or attempting to violate the security of the Web site, including:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { t: "Unauthorized Access", d: "Accessing data not intended for such user or logging into a server." },
                      { t: "Vulnerability Scanning", d: "Attempting to probe, scan or test the vulnerability of a system." },
                      { t: "System Interference", d: "Attempting to interfere with service to any user, host or network (Virus, Trojan, etc)." },
                      { t: "Spam / Unsolicited Mail", d: "Sending unsolicited electronic mail including promotions/advertising." }
                    ].map((rule, i) => (
                      <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <h4 className="font-bold text-emerald-400 text-sm mb-2">{rule.t}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{rule.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Indemnity and Liability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section id="indemnity" className="scroll-mt-28">
                <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm h-full">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Indemnity</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The User unilaterally agree to indemnify and hold harmless, without objection, the Company, its officers, directors, employees and agents from and against any claims, actions and/or demands arising from their use of sugartimes.co.in or their breach of the terms.
                  </p>
                </div>
              </section>
              <section id="liability" className="scroll-mt-28">
                <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm h-full">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-6">
                    <Scale size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Liability</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Company shall not be liable for any direct/indirect/incidental/special/consequential/exemplary damages resulting from the use or the inability to use the service. Our total liability shall not exceed the amount paid by the User (if any).
                  </p>
                </div>
              </section>
            </div>

            {/* Disclaimer of Consequential Damages */}
            <section id="disclaimer" className="scroll-mt-28">
              <div className="bg-rose-50 border-2 border-rose-100 p-8 md:p-12 rounded-[40px]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <AlertTriangle size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Disclaimer</h2>
                </div>
                <div className="prose prose-rose max-w-none">
                  <p className="text-rose-900 font-bold mb-4">
                    Disclaimer of Consequential Damages
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    In no event shall Company or any parties, organizations or entities associated with the corporate brand name us be liable for any damages whatsoever (including, without limitations, incidental and consequential damages, lost profits, or damage to computer hardware or loss of data information or business interruption) resulting from the use or inability to use the Website and the Website material.
                  </p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* ── FOOTER NOTICE ────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              Sugar Times Legal Portal &middot; Last Updated {new Date().getFullYear()}
            </p>
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[11px] hover:text-emerald-700 transition-colors">
              Accept and Return to Home <ChevronRight size={14} />
            </Link>
        </div>
      </div>
    </div>
  );
}
