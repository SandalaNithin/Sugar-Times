"use client";
import { useState } from "react";
import { contactAPI } from "@/lib/api";


export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    designation: "",
    email: "",
    contactNo: "",
    subject: "General Enquiry",
    commentsOrMessage: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await contactAPI.send(form);
      setStatus("success");
      setForm({ fullName: "", designation: "", email: "", contactNo: "", subject: "General Enquiry", commentsOrMessage: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to send. Please try again."
      );
    }
  };


  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Top Section: Header & Intro */}
      <section className="bg-white py-8 sm:py-12 md:py-20 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-4 uppercase tracking-tight">Contact Us</h1>
            <p className="text-slate-600 text-xs sm:text-base md:text-lg leading-relaxed text-justify">
              We&apos;re always happy to hear from our readers, advertisers, subscribers, and industry professionals. Whether you have a news tip, a press release, an advertising inquiry, or just want to say hello — reach out to us through any of the channels below. 
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Map Container */}
            <div className="w-full lg:w-3/5 aspect-video lg:aspect-auto lg:h-[450px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6866.056408725164!2d81.852759!3d25.476161!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca8f1ede9ec5%3A0xe6180b8bd9e6320a!2sSugar%20Times%20Magazine!5e1!3m2!1sen!2sin!4v1774954509068!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sugar Times Magazine Location"
              />
            </div>

            {/* Info Cards */}
            <div className="w-full lg:w-2/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
              {[
                { 
                  icon: <div className="p-3 bg-blue-50 rounded-2xl"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg></div>,
                  title: "Address",
                  content: "485, Mumfordganj (Opposite Shivaji Park), Prayagraj (Allahabad) – 211002, Uttar Pradesh, India "
                },
                { 
                  icon: <div className="p-3 bg-green-50 rounded-2xl"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#057857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>,
                  title: "Phone / Fax",
                  content: <div className="flex flex-col gap-0.5"><span>+91-0532-2440267</span></div>
                },
{
  icon: (<div className="p-3 bg-green-50 rounded-2xl"><svg width="24" height="24" viewBox="0 0 32 32" fill="none"><path d="M16 3C9.37 3 4 8.37 4 15c0 2.64.86 5.08 2.32 7.06L5 29l7.13-1.27A11.94 11.94 0 0016 27c6.63 0 12-5.37 12-12S22.63 3 16 3z" fill="#25D366"/><path d="M23.52 19.2c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37s-1.05 1.02-1.05 2.5c0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.3 1.26.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" fill="white"/></svg></div>),
  title: "Mobile & WhatsApp",
  content: (
    <div className="flex flex-col gap-0.5">
      <span>+91 73554 53462</span>
      <span>+91 94153 05911</span>
    </div>
  )
},
                { 
                  icon: <div className="p-3 bg-cyan-50 rounded-2xl"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>,
                  title: "Email",
                  content: <div className="flex flex-col gap-0.5"><a href="mailto:info@sugartimes.co.in" className="text-cyan-600 hover:underline">info@sugartimes.co.in</a></div>
                },
                {
                  icon: "🌐",
                  title: "Website",
                  content: <div className="flex flex-col gap-0.5"><a href="https://sugartimes.co.in/" className="text-cyan-600 hover:underline">www.sugartimes.co.in</a></div>
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 sm:p-4 lg:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <div className="shrink-0 text-xs sm:text-sm lg:text-base">{item.icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 text-[11px] sm:text-[12px] lg:text-[13px] uppercase tracking-widest mb-1 sm:mb-1.5">{item.title}</h3>
                    <div className="text-slate-500 text-xs sm:text-sm lg:text-sm font-medium leading-relaxed text-justify break-words">{item.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Department Contact Cards */}
      <section className="bg-slate-50 py-10 sm:py-14 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-green-600 font-black uppercase tracking-[0.35em] text-[10px] sm:text-[11px] mb-2 sm:mb-3">Get In Touch</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight px-2">Reach The Right Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">

            {/* Editorial */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl">✏️</div>
              <div>
                <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 uppercase tracking-widest mb-1">Editorial</h3>
                <p className="text-slate-500 text-xs sm:text-sm lg:text-sm leading-relaxed text-justify">
                  For news tips, press releases, interviews, expert articles, and editorial queries.
                </p>
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                <a href="mailto:info@sugartimes.co.in" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span className="truncate">info@sugartimes.co.in</span>
                </a>
                <a href="tel:+917355453462" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.53a2 2 0 0 1 1.11-2.24l3-.29a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.91 8.72a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +91 7355453462
                </a>
              </div>
            </div>

            {/* Advertising */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl">📢</div>
              <div>
                <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 uppercase tracking-widest mb-1">Advertising</h3>
                <p className="text-slate-500 text-xs sm:text-sm lg:text-sm leading-relaxed text-justify">
                  For advertisement bookings, media kit requests, and promotional proposals.
                </p>
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                <a href="mailto:info@sugartimes.co.in" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span className="truncate">info@sugartimes.co.in</span>
                </a>
                <a href="tel:+917355453462" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.53a2 2 0 0 1 1.11-2.24l3-.29a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.91 8.72a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +91 7355453462
                </a>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1">Ask for: Ms. Shashi Yogeshwar, Business Manager</p>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl">📬</div>
              <div>
                <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 uppercase tracking-widest mb-1">Subscriptions</h3>
                <p className="text-slate-500 text-xs sm:text-sm lg:text-sm leading-relaxed text-justify">
                  For print and digital subscription enquiries, renewal, and delivery issues.
                </p>
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                <a href="mailto:info@sugartimes.co.in" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span className="truncate">info@sugartimes.co.in</span>
                </a>
                <a href="/subscription" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  sugartimes.co.in
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WhatsApp Section */}
      <section className="bg-[#075E54] py-10 sm:py-14 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-300 font-black uppercase tracking-[0.35em] text-[10px] sm:text-[11px] mb-2 sm:mb-4">Instant Response</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 px-2">Connect With Us Instantly on WhatsApp</h2>
          <p className="text-green-200/80 text-xs sm:text-sm px-3 text-justify mb-6 sm:mb-8 max-w-lg mx-auto">
            We respond to messages on WhatsApp during working hours<br className="hidden sm:block" />
            <span className="font-semibold text-white">Mon–Sat, 10am–6pm.</span>
          </p>
          <a
            href="https://wa.me/917355453462"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-4 bg-[#25D366] hover:bg-[#20bc59] text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.214 6.347L4.05 28l6.91-1.816A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.5a9.43 9.43 0 0 1-4.78-1.294l-.343-.203-3.56.935.952-3.479-.223-.358A9.444 9.444 0 0 1 6.5 15c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5-4.262 9.5-9.5 9.5zm5.197-7.115c-.285-.143-1.688-.833-1.95-.927-.262-.095-.453-.143-.644.143-.19.285-.738.927-.904 1.118-.167.19-.333.214-.617.071-.285-.143-1.202-.443-2.29-1.413-.846-.754-1.418-1.688-1.584-1.972-.166-.285-.018-.439.125-.581.128-.128.285-.333.428-.5.143-.166.19-.285.285-.476.095-.19.048-.357-.024-.5-.071-.143-.644-1.551-.882-2.122-.232-.553-.47-.477-.644-.486l-.548-.01c-.19 0-.5.072-.762.357-.262.285-1 .977-1 2.382s1.024 2.764 1.167 2.955c.143.19 2.016 3.078 4.885 4.316.683.295 1.215.47 1.63.602.685.218 1.308.187 1.802.113.55-.082 1.688-.69 1.927-1.356.238-.667.238-1.238.166-1.356-.071-.119-.262-.19-.548-.333z"/>
            </svg>
            <span>Chat on WhatsApp → +91 7355453462</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-slate-900 py-16 md:py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-green-500 font-black uppercase tracking-[0.4em] text-[11px] mb-4">Send Us a Message</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">We Love To Hear From You.</h3>
            <p className="text-slate-400 text-sm mt-3">Fill out the form below and we&apos;ll get back to you within 24–48 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-12 rounded-[2.5rem] shadow-2xl">

            {/* Row 1: Name + Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium placeholder:text-slate-600"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                  Designation / Organisation
                </label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium placeholder:text-slate-600"
                  placeholder="e.g. Editor, ABC Sugar Mills"
                />
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium placeholder:text-slate-600"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium placeholder:text-slate-600"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>

            {/* Row 3: Subject */}
            <div className="mb-5">
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">Subject</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium appearance-none cursor-pointer"
              >
                {["General Enquiry", "News Tip", "Press Release", "Advertising", "Subscription", "Other"].map((s) => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>

            {/* Row 4: Message */}
            <div className="mb-8">
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">
                Your Message <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                name="commentsOrMessage"
                value={form.commentsOrMessage}
                onChange={handleChange}
                rows={5}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium resize-none placeholder:text-slate-600"
                placeholder="Write your message here…"
              />
            </div>

            {/* Status Messages + Submit */}
            <div className="flex flex-col items-center gap-5">
              {status === "success" && (
                <p className="text-green-400 text-sm font-bold bg-green-500/10 px-6 py-3 rounded-full border border-green-500/20">
                  ✅ Message sent successfully! We&apos;ll get back to you soon.
                </p>
              )}
              {status === "error" && (
                <p className="text-red-400 text-sm font-bold bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20">
                  ❌ {errorMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="group relative overflow-hidden bg-green-500 text-white px-14 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-green-500/20 flex items-center gap-3"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span className="relative z-10">{status === "loading" ? "Sending…" : "Send Message"}</span>
              </button>
              <p className="text-slate-600 text-xs">Sends to info@sugartimes.co.in · You&apos;ll receive a confirmation email</p>
            </div>

          </form>
        </div>
      </section>
    </div>
  );
}
