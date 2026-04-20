"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isTakeoverPage = pathname === "/about" || 
                         pathname?.startsWith("/login") || 
                         pathname?.startsWith("/register") || 
                         pathname?.startsWith("/admin");

  return (
    <AuthProvider>
      {!isTakeoverPage && <Navbar />}
      <main className={isTakeoverPage ? "min-h-screen grow flex flex-col" : "grow flex flex-col"}>
        {children}
      </main>
      {!isTakeoverPage && <Footer />}
    </AuthProvider>
  );
}
