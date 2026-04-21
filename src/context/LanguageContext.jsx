"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Category labels come from the API in English. Translating them on render is
// the cheapest fix; keys are normalised (lowercase, trimmed, ampersand and
// slash collapsed) so small casing/whitespace differences still match.
const normalizeKey = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const categoryTranslations = {
  hi: {
    [normalizeKey("All")]: "सभी",
    [normalizeKey("Home")]: "होम",
    [normalizeKey("Sugar Industry")]: "शुगर उद्योग",
    [normalizeKey("Ethanol")]: "एथेनॉल",
    [normalizeKey("Farmer")]: "किसान",
    [normalizeKey("Farmer / किसान")]: "किसान",
    [normalizeKey("Market & Prices")]: "बाज़ार एवं भाव",
    [normalizeKey("Markets")]: "बाज़ार",
    [normalizeKey("Technology")]: "तकनीक",
    [normalizeKey("Jaggery & Food")]: "गुड़ एवं खाद्य",
    [normalizeKey("Jaggery / Gur")]: "गुड़",
    [normalizeKey("Jaggery")]: "गुड़",
    [normalizeKey("Sugar & Health")]: "शुगर एवं स्वास्थ्य",
    [normalizeKey("Food Industry")]: "खाद्य उद्योग",
    [normalizeKey("Lifestyle")]: "जीवनशैली",
    [normalizeKey("Agritech")]: "कृषि तकनीक",
    [normalizeKey("News")]: "समाचार",
    [normalizeKey("Videos")]: "वीडियो",
    [normalizeKey("Magazines")]: "पत्रिकाएँ",

    // Sugar Industry children
    [normalizeKey("Sugar Mill News")]: "शुगर मिल समाचार",
    [normalizeKey("Policy")]: "नीति",
    [normalizeKey("Sugarcane Dept.")]: "गन्ना विभाग",
    [normalizeKey("Sugarcane Dept")]: "गन्ना विभाग",
    [normalizeKey("Sugar Prices")]: "शुगर मूल्य",

    // Ethanol children
    [normalizeKey("Blending News")]: "मिश्रण समाचार",
    [normalizeKey("Distillery Projects")]: "डिस्टिलरी परियोजनाएँ",
    [normalizeKey("ENA Trade")]: "ईएनए व्यापार",
    [normalizeKey("Biofuel Policy")]: "जैव ईंधन नीति",
    [normalizeKey("Molasses")]: "शीरा",
    [normalizeKey("E20 Push")]: "E20 अभियान",

    // Farmer children
    [normalizeKey("SAP / FRP Rates")]: "एसएपी / एफआरपी दरें",
    [normalizeKey("Cane Farming")]: "गन्ना खेती",
    [normalizeKey("Hindi News")]: "हिंदी समाचार",

    // Market & Prices children
    [normalizeKey("Market Trends")]: "बाज़ार रुझान",
    [normalizeKey("International Trade")]: "अंतर्राष्ट्रीय व्यापार",
    [normalizeKey("Export / Import")]: "निर्यात / आयात",

    // Technology children
    [normalizeKey("Research & Development")]: "अनुसंधान एवं विकास",
    [normalizeKey("Conferences")]: "सम्मेलन",
    [normalizeKey("Interviews")]: "साक्षात्कार",
  },
};

const translations = {
  en: {
    // Top bar
    login_register: "Login / Register",
    // Navbar labels
    home: "Home",
    admin: "Admin",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    renew: "Renew",
    advertise: "Advertise",
    subscribe: "Subscribe",
    breaking_news: "Breaking News",
    no_breaking: "No breaking news at the moment",
    search_placeholder: "Search news, markets, ethanol...",
    search: "Search",
    // Renewal badges
    badge_expired: "Expired",
    badge_expiring: "Expiring Soon",
    badge_active: "Active",
    // Brand strip
    brand_strip: "Sugar Times · India's #1 Sugar Industry Monthly",
    // News / category page
    all: "All",
    latest_news: "Latest News",
    articles_count: "articles",
    articles_found: "articles found",
    search_prefix: "Search:",
    search_articles_placeholder: "Search articles...",
    no_articles: "No articles found.",
    previous: "Previous",
    next: "Next",
    trending_topics: "Trending Topics",
    newsletter: "Newsletter",
    newsletter_desc: "Daily sugar industry digest",
    your_email: "Your email",
    // Trending keywords
    trend_ethanol_blending: "Ethanol Blending",
    trend_frp: "FRP 2026-27",
    trend_sugar_export: "Sugar Export",
    trend_mh_mills: "Maharashtra Mills",
    trend_cane_prices: "Cane Prices",
    trend_isma: "ISMA Report",
    // News card badges
    badge_hot: "Hot",
    badge_premium: "Premium",
    date_recent: "Recently",
  },
  hi: {
    login_register: "लॉगिन / रजिस्टर",
    home: "होम",
    admin: "प्रशासक",
    dashboard: "डैशबोर्ड",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "रजिस्टर",
    renew: "नवीनीकरण",
    advertise: "विज्ञापन",
    subscribe: "सदस्यता लें",
    breaking_news: "ताज़ा ख़बर",
    no_breaking: "अभी कोई ताज़ा ख़बर नहीं",
    search_placeholder: "समाचार, बाज़ार, एथेनॉल खोजें...",
    search: "खोजें",
    badge_expired: "समाप्त",
    badge_expiring: "जल्द समाप्त",
    badge_active: "सक्रिय",
    brand_strip: "शुगर टाइम्स · भारत की #1 शुगर इंडस्ट्री मासिक पत्रिका",
    all: "सभी",
    latest_news: "ताज़ा समाचार",
    articles_count: "लेख",
    articles_found: "लेख मिले",
    search_prefix: "खोज:",
    search_articles_placeholder: "लेख खोजें...",
    no_articles: "कोई लेख नहीं मिला।",
    previous: "पिछला",
    next: "अगला",
    trending_topics: "चर्चित विषय",
    newsletter: "न्यूज़लेटर",
    newsletter_desc: "दैनिक शुगर उद्योग सारांश",
    your_email: "आपका ईमेल",
    trend_ethanol_blending: "एथेनॉल मिश्रण",
    trend_frp: "एफआरपी 2026-27",
    trend_sugar_export: "शुगर निर्यात",
    trend_mh_mills: "महाराष्ट्र मिलें",
    trend_cane_prices: "गन्ना मूल्य",
    trend_isma: "ISMA रिपोर्ट",
    badge_hot: "चर्चित",
    badge_premium: "प्रीमियम",
    date_recent: "हाल ही में",
  },
};

const LanguageContext = createContext(null);

// Google Translate reads the googtrans cookie on load. Setting it on both the
// hostname and the parent domain covers localhost + deployed envs. A reload is
// required because the widget only applies the cookie at page load.
const setGoogTransCookie = (value) => {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join(".");
  const expire = value
    ? "expires=Fri, 31 Dec 9999 23:59:59 GMT"
    : "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const val = value || "";
  document.cookie = `googtrans=${val}; path=/; ${expire}`;
  document.cookie = `googtrans=${val}; path=/; domain=${host}; ${expire}`;
  if (parent && parent !== host) {
    document.cookie = `googtrans=${val}; path=/; domain=.${parent}; ${expire}`;
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (stored === "hi" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (next) => {
    setLangState(next);
    if (typeof window === "undefined") return;
    localStorage.setItem("lang", next);
    if (next === "hi") {
      setGoogTransCookie("/en/hi");
    } else {
      setGoogTransCookie("");
    }
    window.location.reload();
  };

  const toggleLang = () => setLang(lang === "en" ? "hi" : "en");

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;

  // Translate a category / dropdown label that came from the API (English).
  // Falls back to the original if no translation is registered.
  const tCategory = (name) => {
    if (lang === "en" || !name) return name;
    const hit = categoryTranslations[lang]?.[normalizeKey(name)];
    return hit ?? name;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
};
