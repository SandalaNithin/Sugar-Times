"use client";
import { useEffect, useState } from "react";

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const PinterestIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.85 6.37 9.3-.09-.79-.17-2 .04-2.87.19-.77 1.21-4.93 1.21-4.93s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.89 0 1.31.67 1.31 1.46 0 .89-.57 2.22-.86 3.45-.25 1.04.52 1.88 1.53 1.88 1.84 0 3.25-1.94 3.25-4.74 0-2.47-1.78-4.21-4.32-4.21-2.94 0-4.67 2.21-4.67 4.49 0 .89.34 1.84.77 2.36.08.1.1.19.07.29l-.3 1.22c-.05.19-.15.24-.35.14-1.31-.61-2.13-2.52-2.13-4.06 0-3.3 2.4-6.34 6.91-6.34 3.63 0 6.45 2.59 6.45 6.04 0 3.6-2.27 6.5-5.43 6.5-1.06 0-2.06-.55-2.4-1.2l-.65 2.49c-.24.91-.88 2.05-1.31 2.75.99.31 2.03.47 3.12.47 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.52 3.449A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892a11.88 11.88 0 0 0 1.587 5.946L.057 24l6.304-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 0 0-3.422-8.452M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.82 9.82 0 0 1 6.988 2.898 9.82 9.82 0 0 1 2.895 6.992c-.003 5.452-4.437 9.886-9.888 9.886m5.424-7.403c-.297-.149-1.758-.867-2.031-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function ArticleShareBar({ url, title, showLabel = true }) {
  // Prefer the live browser URL so the share targets always open
  // the actual page the user is on — fixes sharing "localhost" or
  // stale SSR-provided URLs in production.
  const [liveUrl, setLiveUrl] = useState(url || "");
  useEffect(() => {
    if (typeof window !== "undefined") setLiveUrl(window.location.href);
  }, []);

  const shareTitle = encodeURIComponent(title || "");
  const shareUrl = encodeURIComponent(liveUrl);

  const buttons = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      bg: "bg-[#1877F2] hover:bg-[#0d5dcc]",
      icon: <FacebookIcon />,
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}&via=SugarTimes`,
      bg: "bg-black hover:bg-slate-800",
      icon: <XIcon />,
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareTitle}`,
      bg: "bg-[#E60023] hover:bg-red-700",
      icon: <PinterestIcon />,
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`,
      bg: "bg-[#25D366] hover:bg-green-600",
      icon: <WhatsAppIcon />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${shareTitle}`,
      bg: "bg-[#0A66C2] hover:bg-blue-800",
      icon: <LinkedInIcon />,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({ url: liveUrl, title }).catch(() => {});
            }
          }}
          className="px-3 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest transition-colors"
        >
          Share
        </button>
      )}
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${b.label}`}
          title={`Share on ${b.label}`}
          className={`${b.bg} text-white w-8 h-8 rounded-md flex items-center justify-center transition-colors shadow-sm`}
        >
          {b.icon}
        </a>
      ))}
    </div>
  );
}
