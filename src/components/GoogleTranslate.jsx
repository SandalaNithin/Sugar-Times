"use client";
import { useEffect } from "react";

// Google Translate wraps text nodes in <font> elements, which breaks React's
// reconciliation (insertBefore / removeChild on a node whose parent changed).
// Patching these two DOM methods to be forgiving is the standard workaround.
// Why: without this, any re-render inside a translated subtree throws
// NotFoundError: "Failed to execute 'insertBefore' on 'Node'".
const patchDomForGoogleTranslate = () => {
  if (typeof Node === "undefined" || !Node.prototype) return;
  if (Node.prototype.__gtPatched) return;
  Node.prototype.__gtPatched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (child.parentNode) return child.parentNode.removeChild(child);
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return this.appendChild(newNode);
    }
    return originalInsertBefore.apply(this, arguments);
  };
};

// Mounts a hidden Google Translate element. The widget reads the `googtrans`
// cookie set by LanguageContext and rewrites the DOM to the target language,
// which gets us full-site Hindi coverage including API-driven article bodies.
export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    patchDomForGoogleTranslate();
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-undef
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" aria-hidden="true" />;
}
