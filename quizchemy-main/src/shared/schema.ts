import { z } from "zod";

export const stepItemSchema = z.object({
  label: z.string(),
  description: z.string(),
});

export type StepItem = z.infer<typeof stepItemSchema>;

export const comparisonItemSchema = z.object({
  label: z.string(),
  left: z.string(),
  right: z.string(),
});

export type ComparisonItem = z.infer<typeof comparisonItemSchema>;

export const columnItemSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export type ColumnItem = z.infer<typeof columnItemSchema>;

export const sectionItemSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export type SectionItem = z.infer<typeof sectionItemSchema>;

export const calloutSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type Callout = z.infer<typeof calloutSchema>;

export const gridItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type GridItem = z.infer<typeof gridItemSchema>;

export const cardItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export type CardItem = z.infer<typeof cardItemSchema>;

export const slideImageSchema = z.object({
  url: z.string(),
  prompt: z.string(),
});

export type SlideImage = z.infer<typeof slideImageSchema>;

export const positionOverrideSchema = z.object({
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
});

export type PositionOverride = z.infer<typeof positionOverrideSchema>;

export const layoutOverridesSchema = z.record(z.string(), positionOverrideSchema);

export type LayoutOverrides = z.infer<typeof layoutOverridesSchema>;

export const bulletStyleSchema = z.enum(["bullet", "numbered", "checkmark", "arrow", "star"]);

export type BulletStyle = z.infer<typeof bulletStyleSchema>;

export const horizontalStepSchema = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
});

export type HorizontalStep = z.infer<typeof horizontalStepSchema>;

export const numberedCardSchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string(),
});

export type NumberedCard = z.infer<typeof numberedCardSchema>;

export const slideSchema = z.object({
  id: z.string(),
  type: z.enum(["title", "content", "bullets", "steps", "comparison", "columns", "sections", "grid", "cards", "horizontal-steps", "numbered-cards"]),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  bulletStyle: bulletStyleSchema.optional().default("bullet"),
  steps: z.array(stepItemSchema).optional(),
  comparison: z.object({
    leftTitle: z.string(),
    rightTitle: z.string(),
    items: z.array(comparisonItemSchema),
  }).optional(),
  columns: z.array(columnItemSchema).optional(),
  sections: z.array(sectionItemSchema).optional(),
  grid: z.array(gridItemSchema).optional(),
  cards: z.array(cardItemSchema).optional(),
  horizontalSteps: z.array(horizontalStepSchema).optional(),
  numberedCards: z.array(numberedCardSchema).optional(),
  callout: calloutSchema.optional(),
  image: slideImageSchema.optional(),
  layoutOverrides: layoutOverridesSchema.optional(),
});

export type Slide = z.infer<typeof slideSchema>;

export const presentationThemes = {
  modern: {
    id: "modern",
    name: "Modern",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#f093fb",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.8)",
    titleColor: "#fef08a",
    labelColor: "#fef08a", // Bright yellow for labels
    buttonBg: "#FFFFFF",
    buttonText: "#667eea",
  },
  minimalist: {
    id: "minimalist",
    name: "Minimalist",
    gradient: "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)",
    primary: "#2d3748",
    secondary: "#4a5568",
    accent: "#718096",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.7)",
    titleColor: "#93c5fd",
    labelColor: "#93c5fd", // Light blue for labels
    buttonBg: "#FFFFFF",
    buttonText: "#2d3748",
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #e0f2fe 50%, #38bdf8 100%)",
    primary: "#0369a1",
    secondary: "#38bdf8",
    accent: "#0ea5e9",
    text: "#0f172a",
    textSecondary: "#475569",
    titleColor: "#0369a1",
    labelColor: "#0ea5e9", // Bright cyan for labels
    buttonBg: "#0369a1",
    buttonText: "#FFFFFF",
  },
  creative: {
    id: "creative",
    name: "Creative",
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
    primary: "#f97316",
    secondary: "#ef4444",
    accent: "#ec4899",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#fef9c3",
    labelColor: "#fef9c3", // Light yellow for labels
    buttonBg: "#1f2937",
    buttonText: "#FFFFFF",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
    primary: "#06b6d4",
    secondary: "#3b82f6",
    accent: "#8b5cf6",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#a5f3fc",
    labelColor: "#a5f3fc", // Bright cyan for labels
    buttonBg: "#FFFFFF",
    buttonText: "#3b82f6",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
    primary: "#f59e0b",
    secondary: "#f97316",
    accent: "#ef4444",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#fef3c7",
    labelColor: "#fef3c7", // Light amber for labels
    buttonBg: "#1f2937",
    buttonText: "#FFFFFF",
  },
  nature: {
    id: "nature",
    name: "Nature",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#047857",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#d9f99d",
    labelColor: "#d9f99d", // Light lime for labels
    buttonBg: "#FFFFFF",
    buttonText: "#059669",
  },
  dark: {
    id: "dark",
    name: "Dark",
    gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    text: "#f8fafc",
    textSecondary: "#94a3b8",
    titleColor: "#60a5fa",
    labelColor: "#fbbf24", // Bright amber for labels
    buttonBg: "#3b82f6",
    buttonText: "#FFFFFF",
  },
  rose: {
    id: "rose",
    name: "Rose",
    gradient: "linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #e11d48 100%)",
    primary: "#e11d48",
    secondary: "#fb7185",
    accent: "#fda4af",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.9)",
    titleColor: "#fef9c3",
    labelColor: "#fef9c3", // Light yellow for labels
    buttonBg: "#1f2937",
    buttonText: "#FFFFFF",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 50%, #000814 100%)",
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
    text: "#f0f9ff",
    textSecondary: "rgba(240,249,255,0.8)",
    titleColor: "#60a5fa",
    labelColor: "#fcd34d", // Bright yellow for labels
    buttonBg: "#3b82f6",
    buttonText: "#FFFFFF",
  },
  forest: {
    id: "forest",
    name: "Forest",
    gradient: "linear-gradient(135deg, #14532d 0%, #166534 50%, #22c55e 100%)",
    primary: "#22c55e",
    secondary: "#16a34a",
    accent: "#86efac",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#86efac",
    labelColor: "#bef264", // Bright lime for labels
    buttonBg: "#FFFFFF",
    buttonText: "#166534",
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    gradient: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #7c3aed 100%)",
    primary: "#7c3aed",
    secondary: "#a78bfa",
    accent: "#c4b5fd",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.9)",
    titleColor: "#fef08a",
    labelColor: "#fef08a", // Bright yellow for labels
    buttonBg: "#1f2937",
    buttonText: "#FFFFFF",
  },
  warm: {
    id: "warm",
    name: "Warm",
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #d97706 100%)",
    primary: "#d97706",
    secondary: "#f59e0b",
    accent: "#fbbf24",
    text: "#1c1917",
    textSecondary: "#44403c",
    titleColor: "#92400e",
    labelColor: "#92400e", // Dark brown for labels (light bg)
    buttonBg: "#1c1917",
    buttonText: "#FFFFFF",
  },
  neon: {
    id: "neon",
    name: "Neon",
    gradient: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
    primary: "#00f5d4",
    secondary: "#f15bb5",
    accent: "#fee440",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.7)",
    titleColor: "#00f5d4",
    labelColor: "#fee440", // Bright yellow for labels
    buttonBg: "#f15bb5",
    buttonText: "#0f0f0f",
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    gradient: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 50%, #d6d3d1 100%)",
    primary: "#78716c",
    secondary: "#a8a29e",
    accent: "#57534e",
    text: "#1c1917",
    textSecondary: "#44403c",
    titleColor: "#44403c",
    labelColor: "#57534e", // Dark stone for labels (light bg)
    buttonBg: "#1c1917",
    buttonText: "#FFFFFF",
  },
  executive: {
    id: "executive",
    name: "Executive",
    gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
    primary: "#f8fafc",
    secondary: "#cbd5e1",
    accent: "#94a3b8",
    text: "#f8fafc",
    textSecondary: "rgba(248,250,252,0.8)",
    titleColor: "#93c5fd",
    labelColor: "#93c5fd", // Light blue for labels
    buttonBg: "#f8fafc",
    buttonText: "#1e293b",
  },
  sapphire: {
    id: "sapphire",
    name: "Sapphire",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)",
    primary: "#60a5fa",
    secondary: "#3b82f6",
    accent: "#93c5fd",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#bfdbfe",
    labelColor: "#fcd34d", // Bright yellow for labels
    buttonBg: "#FFFFFF",
    buttonText: "#1d4ed8",
  },
  charcoal: {
    id: "charcoal",
    name: "Charcoal",
    gradient: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)",
    primary: "#a1a1aa",
    secondary: "#71717a",
    accent: "#d4d4d8",
    text: "#fafafa",
    textSecondary: "rgba(250,250,250,0.75)",
    titleColor: "#93c5fd",
    labelColor: "#fbbf24", // Bright amber for labels
    buttonBg: "#fafafa",
    buttonText: "#18181b",
  },
  bordeaux: {
    id: "bordeaux",
    name: "Bordeaux",
    gradient: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)",
    primary: "#fca5a5",
    secondary: "#f87171",
    accent: "#fecaca",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.85)",
    titleColor: "#fecaca",
    labelColor: "#fef08a", // Bright yellow for labels
    buttonBg: "#fef2f2",
    buttonText: "#7f1d1d",
  },
  slate: {
    id: "slate",
    name: "Slate",
    gradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
    primary: "#475569",
    secondary: "#64748b",
    accent: "#334155",
    text: "#0f172a",
    textSecondary: "#334155",
    titleColor: "#1e40af",
    labelColor: "#1e40af", // Dark blue for labels (light bg)
    buttonBg: "#0f172a",
    buttonText: "#FFFFFF",
  },
} as const;

export type ThemeId = keyof typeof presentationThemes;
export type PresentationTheme = typeof presentationThemes[ThemeId];

export const outlineItemSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()).optional().default([]),
});

export const generateSlidesRequestSchema = z.object({
  pdfText: z.string().min(1),
  slideCount: z.number().min(3).max(20).optional().default(5),
  language: z.string().optional().default("English"),
  theme: z.enum(["modern", "minimalist", "corporate", "creative", "ocean", "sunset", "nature", "dark", "rose", "midnight", "forest", "lavender", "warm", "neon", "elegant", "executive", "sapphire", "charcoal", "bordeaux", "slate"]).optional().default("modern"),
  contentDensity: z.enum(["minimal", "concise", "detailed", "extensive"]).optional().default("concise"),
  outline: z.array(outlineItemSchema).optional(),
});

export type GenerateSlidesRequest = z.infer<typeof generateSlidesRequestSchema>;

export const generateSlidesResponseSchema = z.object({
  slides: z.array(slideSchema),
});

export type GenerateSlidesResponse = z.infer<typeof generateSlidesResponseSchema>;
