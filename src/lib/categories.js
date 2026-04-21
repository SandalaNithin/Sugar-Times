// Central category taxonomy for Sugar Times
// Used by Navbar, Footer, News filters, Admin article editor, etc.

export const CATEGORY_TREE = [
  {
    slug: "sugar-industry",
    label: "Sugar Industry",
    emoji: "\u{1F3ED}",
    color: "from-emerald-500 to-teal-600",
    children: [
      { slug: "sugar-mill-news", label: "Sugar Mill News" },
      { slug: "policy", label: "Policy" },
      { slug: "sugarcane-dept", label: "Sugarcane Dept." },
      { slug: "sugar-prices", label: "Sugar Prices" },
    ],
  },
  {
    slug: "ethanol",
    label: "Ethanol",
    emoji: "\u{1F9EA}",
    color: "from-amber-500 to-orange-600",
    children: [
      { slug: "blending-news", label: "Blending News" },
      { slug: "distillery-projects", label: "Distillery Projects" },
      { slug: "ena-trade", label: "ENA Trade" },
      { slug: "biofuel-policy", label: "Biofuel Policy" },
      { slug: "molasses", label: "Molasses" },
      { slug: "e20-push", label: "E20 Push" },
    ],
  },
  {
    slug: "farmer",
    label: "Farmer / \u0915\u093F\u0938\u093E\u0928",
    emoji: "\u{1F33E}",
    color: "from-lime-500 to-green-600",
    children: [
      { slug: "sap-frp-rates", label: "SAP / FRP Rates" },
      { slug: "cane-farming", label: "Cane Farming" },
      { slug: "agritech", label: "AgriTech" },
      { slug: "hindi-news", label: "Hindi News" },
    ],
  },
  {
    slug: "market-prices",
    label: "Market & Prices",
    emoji: "\u{1F4C8}",
    color: "from-sky-500 to-blue-600",
    children: [
      { slug: "market-trends", label: "Market Trends" },
      { slug: "market-rates", label: "Market Rates" },
      { slug: "international-trade", label: "International Trade" },
      { slug: "export-import", label: "Export / Import" },
    ],
  },
  {
    slug: "technology",
    label: "Technology",
    emoji: "\u{1F52C}",
    color: "from-violet-500 to-purple-600",
    children: [
      { slug: "research-development", label: "Research & Development" },
      { slug: "conferences", label: "Conferences" },
      { slug: "interviews", label: "Interviews" },
    ],
  },
  {
    slug: "jaggery-food",
    label: "Jaggery & Food",
    emoji: "\u{1F36C}",
    color: "from-rose-500 to-pink-600",
    children: [
      { slug: "jaggery-gur", label: "Jaggery / Gur" },
      { slug: "sugar-health", label: "Sugar & Health" },
      { slug: "food-industry", label: "Food Industry" },
      { slug: "lifestyle", label: "Lifestyle" },
    ],
  },
];

// Helper: flat list of all categories (for dropdowns, filters)
export const ALL_CATEGORIES = CATEGORY_TREE.flatMap((parent) => [
  { slug: parent.slug, label: parent.label, parent: null },
  ...parent.children.map((c) => ({ ...c, parent: parent.slug })),
]);

// Build a news URL for a given category label
export const categoryHref = (label) =>
  `/news?category=${encodeURIComponent(label)}`;

// Find parent by label (used to highlight nav groups)
export const findParent = (slug) =>
  CATEGORY_TREE.find(
    (p) => p.slug === slug || p.children.some((c) => c.slug === slug)
  );
