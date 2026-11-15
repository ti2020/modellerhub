// Tarig Salah's own AFM-standard practice models. Each one is shown read-only:
// values and formatting only, extracted at build time — formulas never reach the browser.
export type ModelEntry = {
  slug: string;
  name: string;
  /** One-line description of what makes this case distinctive. */
  focus: string;
  tags: string[];
  /** Header colour for this model (white text must read on it). */
  color: string;
};

export const MODELLER = "Tarig Salah, AFM";

export const MODELS: ModelEntry[] = [
  { slug: "henderson", name: "Henderson Manufacturing", focus: "FMI's sample AFM case: capacity-driven volumes and scenario switches", tags: ["Sample exam", "Scenarios"], color: "#1F4FC1" },
  { slug: "passion-paints", name: "Passion Paints", focus: "Investment case with a full three-statement build", tags: ["Investment case"], color: "#B4442E" },
  { slug: "transatlantic-railways", name: "Transatlantic Railways", focus: "Exam practice on a capital-heavy railway operator", tags: ["Exam practice", "Capex"], color: "#2F5D50" },
  { slug: "global-discount", name: "Global Discount", focus: "The October 2017 AFM case, built under exam conditions", tags: ["Former FMI exam"], color: "#6A3FA0" },
  { slug: "nudu-noodles", name: "NuduNoodles", focus: "Debt schedule with a repayment twist", tags: ["Debt trick"], color: "#9A5B00" },
  { slug: "blue-rose", name: "Blue Rose", focus: "Debt amortised as a percentage of the opening balance", tags: ["Amortization %"], color: "#1D5C8C" },
  { slug: "bnd", name: "BND", focus: "Straight-line depreciation across the asset base", tags: ["Straight-line"], color: "#7A3B5C" },
  { slug: "purewave-sips", name: "PureWave Sips", focus: "Minimum cash balance with declining-balance depreciation", tags: ["Minimum cash", "Declining balance"], color: "#0F6E78" },
  { slug: "etd-homes", name: "ETD Homes", focus: "Declining-balance depreciation in a home-builder model", tags: ["Declining balance"], color: "#5A4A2F" },
  { slug: "fast-moving-inc", name: "Fast Moving Inc. (World Cup)", focus: "Event-driven revenue around a World Cup season", tags: ["Event revenue"], color: "#A02F4A" },
  { slug: "fresh-and-fab", name: "Fresh & Fab", focus: "Debt repaid as a percentage, with a twist in the schedule", tags: ["Debt trick %"], color: "#2E6B2E" },
  { slug: "gators", name: "Gators", focus: "Declining-balance depreciation and full integration", tags: ["Declining balance"], color: "#4A4FA8" },
  { slug: "jkl-logistics", name: "JKL Logistics", focus: "Logistics operator with declining-balance depreciation", tags: ["Declining balance"], color: "#8A4B1F" },
  { slug: "lnc-manufacturing", name: "LNC Manufacturing", focus: "The April 2018 AFM case", tags: ["Former FMI exam"], color: "#335C67" },
  { slug: "parker-inc", name: "Parker Inc.", focus: "The October 2020 AFM case", tags: ["Former FMI exam"], color: "#6B2F8A" },
  { slug: "storage-corp", name: "Storage Corp", focus: "Self-storage operator from a former certified AFM exam", tags: ["Former FMI exam"], color: "#2D5F9A" },
  { slug: "farly-inc", name: "Farly Inc.", focus: "Variable debt rate, straight-line depreciation and tax", tags: ["Variable rate", "Tax"], color: "#7C3A2D" },
];

export const findModel = (slug: string) => MODELS.find(m => m.slug === slug);
