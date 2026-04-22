import Link from "next/link";
import Image from "next/image";
import { 
  Shield, 
  Lock, 
  Eye, 
  Cookie, 
  Share2, 
  UserCheck, 
  MessageSquare, 
  Image as ImageIcon, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronRight
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Sugar Times",
  description: "Our commitment to protecting your personal information and maintaining your privacy.",
};

const sections = [
  { id: "who-we-are", title: "Who we are", icon: Shield },
  { id: "comments", title: "Comments", icon: MessageSquare },
  { id: "media", title: "Media", icon: ImageIcon },
  { id: "cookies", title: "Cookies", icon: Cookie },
  { id: "embedded-content", title: "Embedded content", icon: Share2 },
  { id: "data-sharing", title: "Who we share data with", icon: Lock },
  { id: "data-retention", title: "How long we retain data", icon: Clock },
  { id: "your-rights", title: "Your rights over data", icon: UserCheck },
  { id: "user-info", title: "User Information", icon: Eye },
  { id: "grievance", title: "Grievance Redressal", icon: Mail },
];

export default function PrivacyPolicyPage() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 to-slate-950/90 backdrop-blur-[4px]" />
        
        <div className="relative z-10 text-center px-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-widest text-[11px]"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full" />
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
            At Sugar Times, we are committed to protecting your personal information and your right to privacy. This policy explains our practices regarding your data.
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
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 px-2">On this page</h4>
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
              
              <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/10">
                <h4 className="text-lg font-black mb-2">Need Help?</h4>
                <p className="text-emerald-100 text-[13px] mb-4 leading-relaxed">
                  Have questions about your data or these policies? Contact our support team.
                </p>
                <Link 
                  href="/contact" 
                  className="block text-center py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-bold transition-all"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* ── ARTICLE CONTENT ──────────────────────────────────── */}
          <main className="flex-1 space-y-16">
            
            {/* Acknowledgement Header */}
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm leading-relaxed">
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 font-medium italic mb-6">
                  The terms “We” / “Us” / “Our”/”Company” individually and collectively refer to Sugar Times and the terms “You” /”Your” / “Yourself” refer to the users.
                </p>
                <p className="text-sm text-slate-600">
                  This Privacy Policy is a legally binding document between you and Sugar Times. The terms of this Privacy Policy will be effective upon your acceptance of the same (directly or indirectly in electronic form, by use of the website) and will govern the relationship between you and Sugar Times for your use of the website <strong>“Sugartimes.co.in”</strong>.
                </p>
              </div>
            </div>

            {/* Who we are */}
            <section id="who-we-are" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Shield size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Who we are</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm">
                <p className="text-slate-600 leading-relaxed">Our website address is: <a href="https://sugartimes.co.in" className="text-emerald-600 font-bold underline">https://sugartimes.co.in</a>.</p>
              </div>
            </section>

            {/* Comments */}
            <section id="comments" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <MessageSquare size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Comments</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" className="text-emerald-600 underline">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.
                </p>
              </div>
            </section>

            {/* Media */}
            <section id="media" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                  <ImageIcon size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Media</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm">
                <p className="text-slate-600 leading-relaxed">
                  If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
                  <Cookie size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Cookies</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-800 mb-2 uppercase tracking-wider text-xs">For Commenting</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These last for one year.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-800 mb-2 uppercase tracking-wider text-xs">For Login</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">We set a temporary cookie to determine if your browser accepts cookies. Login cookies last for two days, and screen options cookies for a year.</p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed pt-4 border-t border-slate-100">
                  To improve the responsiveness of the sites for our users, we may use “cookies”, or similar electronic tools to collect information to assign each visitor a unique, random number as a User Identification (User ID). A cookie cannot read data off your hard drive. 
                </p>
              </div>
            </section>

            {/* Embedded Content */}
            <section id="embedded-content" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Share2 size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Embedded content</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm leading-relaxed text-slate-600">
                <p className="mb-4">Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.</p>
                <p>These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content.</p>
              </div>
            </section>

            {/* User Information */}
            <section id="user-info" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                  <Eye size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">User Information</h2>
              </div>
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  To avail certain services on our Websites, users are required to provide certain information for the registration process namely: – a) your name, b) email address, c) sex, d) age, e) PIN code, f) credit card or debit card details g) medical records and history h) sexual orientation, i) biometric information, j) password etc.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Name and Email Address",
                    "Demographic Profile (Age, Sex)",
                    "Interests and Occupations",
                    "Security Information (Passwords)",
                    "Payment Details (where applicable)",
                    "Biometric / Medical Info (service-dependent)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Retention and Rights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section id="data-retention" className="scroll-mt-28">
                <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm h-full">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Retention</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    If you leave a comment, the comment and its metadata are retained indefinitely. For registered users, we store the personal information provided in their profile.
                  </p>
                </div>
              </section>
              <section id="your-rights" className="scroll-mt-28">
                <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm h-full">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-6">
                    <UserCheck size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Your Rights</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    You can request to receive an exported file of the personal data we hold about you. You can also request that we erase any personal data we hold about you.
                  </p>
                </div>
              </section>
            </div>

            {/* Grievance Redressal */}
            <section id="grievance" className="scroll-mt-28">
              <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Grievance Redressal</h2>
                      <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mt-1">Redressal Mechanism</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Any complaints, abuse or concerns with regards to content and or comment or breach of these terms shall be immediately informed to the designated Grievance Officer via writing or through email signed with electronic signature to Pranav Mishra.
                      </p>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <h4 className="font-bold text-lg mb-4 text-emerald-400">Mr. Pranav Mishra</h4>
                        <p className="text-slate-300 text-sm font-medium">Grievance Officer</p>
                        <p className="text-slate-400 text-sm mt-2">Sugar Times Magazine</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                        <MapPin className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" size={20} />
                        <div>
                          <p className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Address</p>
                          <p className="text-sm text-slate-300">H.485, Mumfordganj, Prayagraj- 211002 (U.P)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                        <Mail className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" size={20} />
                        <div>
                          <p className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Email</p>
                          <p className="text-sm text-slate-300 break-all">upsugartimes@gmail.com</p>
                          <p className="text-sm text-slate-300 break-all mt-1">info@sugartimes.co.in</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                        <Phone className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" size={20} />
                        <div>
                          <p className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Contact</p>
                          <p className="text-sm text-slate-300">+91 0532 2440267</p>
                          <p className="text-sm text-slate-300 mt-1">+91 73554 53462</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* ── FOOTER NOTICE ────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-xs font-medium max-w-2xl mx-auto leading-relaxed">
              This document is published and shall be construed in accordance with the provisions of the Information Technology rules, 2011 under Information Technology Act, 2000.
            </p>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[11px] hover:text-emerald-700 transition-colors">
              Accept and Return to Home <ChevronRight size={14} />
            </Link>
        </div>
      </div>
    </div>
  );
}
