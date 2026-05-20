"use client";
import { useEffect, useRef } from "react";

const NB_HYPHEN = "‑"; // ‑ (non-breaking hyphen)
const NBSP = " "; // ( non-breaking space)
const ZWSP = "​"; // zero-width space
const ZWNBSP = "﻿"; // zero-width no-break space / BOM

// Replace regular hyphens inside hyphenated tokens with non-breaking hyphens
// so the browser will not split them across lines under text-align: justify.
//   2025-26 -> 2025‑26
//   COVID-19 -> COVID‑19
//   government-to-government -> government‑to‑government
function protectHyphens(text) {
  return text.replace(/(\S)-(\S)/g, (m, a, b) => `${a}${NB_HYPHEN}${b}`);
}

// CMS HTML (WordPress, TinyMCE, etc.) routinely contains non-breaking spaces
// between words, plus invisible zero-width characters from copy-paste. These
// prevent the browser from wrapping lines, causing entire sentences to render
// as one unbreakable token that overflows the container. Normalise them to
// real spaces. (We keep the non-breaking *hyphens* we added on purpose.)
function normaliseSpaces(text) {
  return text
    .replace(/ /g, " ") // NBSP -> space
    .replace(/ /g, " ") // narrow NBSP -> space
    .replace(/​/g, "") // zero-width space -> remove
    .replace(/﻿/g, ""); // BOM / ZW no-break space -> remove
}

function walk(node) {
  if (!node) return;
  if (node.nodeType === Node.TEXT_NODE) {
    let v = node.nodeValue;
    v = normaliseSpaces(v);
    v = protectHyphens(v);
    if (v !== node.nodeValue) node.nodeValue = v;
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tag = node.tagName;
    // Skip elements where the original whitespace / hyphens matter
    if (tag === "CODE" || tag === "PRE" || tag === "KBD" || tag === "SAMP") return;
    // Strip width / height attributes that some CMSes hard-code on tables,
    // images and iframes — these force the layout wider than the card.
    if (tag === "TABLE" || tag === "IFRAME" || tag === "VIDEO" || tag === "OBJECT" || tag === "EMBED" || tag === "IMG") {
      if (node.hasAttribute("width")) node.removeAttribute("width");
      if (tag !== "IMG" && node.hasAttribute("height")) node.removeAttribute("height");
      if (node.style && node.style.width) node.style.width = "";
      if (node.style && node.style.minWidth) node.style.minWidth = "";
    }
    // Strip inline width / min-width on any other element too (CMS junk).
    if (node.style) {
      if (node.style.width && node.style.width !== "auto") node.style.width = "";
      if (node.style.minWidth) node.style.minWidth = "";
      if (node.style.maxWidth && /[0-9]+px/.test(node.style.maxWidth)) {
        node.style.maxWidth = "100%";
      }
    }
    for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
  }
}

export default function ArticleContent({ html, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) walk(ref.current);
  }, [html]);

  return (
    <div
      ref={ref}
      className={`article-content-body ${className}`}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
