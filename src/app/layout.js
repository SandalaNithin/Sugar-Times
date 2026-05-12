import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "Sugar Times - Monthly News Magazine on Sugar and Biofuel industry",
  description: "Sugar Times is a leading monthly magazine focusing on the sugar and biofuel industry since 2015. 12 issues per year.",
  keywords: ["Sugar Industry", "Biofuel", "Ethanol", "Sugarcane Prices", "Sugar Times Magazine", "Industry News"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sugartimes.co.in/",
  },
  icons: {
    icon: "/ST Logo.png",
    shortcut: "/ST Logo.png",
    apple: "/ST Logo.png",
  },
  openGraph: {
    title: "Sugar Times - Monthly News Magazine on Sugar and Biofuel industry",
    description: "Sugar Times is a leading monthly magazine focusing on the sugar and biofuel industry since 2015.",
    url: "https://sugartimes.co.in/",
    siteName: "Sugar Times",
    images: [
      {
        url: "https://sugartimes.co.in/ST Logo.png",
        width: 800,
        height: 800,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sugar Times - Monthly News Magazine",
    description: "Focusing on the sugar and biofuel industry since 2015.",
    images: ["https://sugartimes.co.in/ST Logo.png"],
  },
  // Google Publisher / News specific
  other: {
    "google-site-verification": "YOUR_VERIFICATION_CODE_HERE",
    "news_keywords": "Sugar, Ethanol, Biofuel, Energy, Agriculture",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 font-sans" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
