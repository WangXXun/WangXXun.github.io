export type ActId =
  | "prologue"
  | "design"
  | "build"
  | "city"
  | "evaluate"
  | "reconstruct"
  | "embody"
  | "index";

export type ActTheme = "paper" | "paperWarm" | "night" | "void";

export interface ActDef {
  id: ActId;
  /** HUD chapter label, always English. */
  tag: string;
  no: string;
  /** Scroll length in vh on desktop. Mobile applies MOBILE_SCALE. */
  vh: number;
  theme: ActTheme;
  scale: string;
  /** Whether the full scene is built (vs. placeholder). */
  ready: boolean;
}

export const ACTS: ActDef[] = [
  { id: "prologue", tag: "", no: "00", vh: 65, theme: "paper", scale: "1:100", ready: true },
  { id: "design", tag: "DESIGN", no: "01", vh: 190, theme: "paper", scale: "1:50", ready: true },
  { id: "build", tag: "BUILD", no: "02", vh: 150, theme: "paperWarm", scale: "1:1", ready: true },
  { id: "city", tag: "CITY", no: "03", vh: 130, theme: "paper", scale: "1:5000", ready: false },
  { id: "evaluate", tag: "EVALUATE", no: "04", vh: 220, theme: "night", scale: "1:5000", ready: false },
  { id: "reconstruct", tag: "RECONSTRUCT", no: "05", vh: 180, theme: "void", scale: "1:1 RECON", ready: false },
  { id: "embody", tag: "EMBODY", no: "06", vh: 210, theme: "void", scale: "1:1", ready: false },
  { id: "index", tag: "INDEX", no: "", vh: 185, theme: "paper", scale: "1:100", ready: true },
];

export const MOBILE_SCALE = 0.65;

export const THEME_BG: Record<ActTheme, string> = {
  paper: "#F2F0EB",
  paperWarm: "#F0EBE2",
  night: "#0A0E14",
  void: "#05070A",
};

export const COLORS = {
  paper: "#F2F0EB",
  model: "#FAFAF7",
  shadow: "#CFCAC0",
  ink: "#1A1A1A",
  orange: "#FF4F1A",
  night: "#0A0E14",
  void: "#05070A",
  cloud: "#DDE7F0",
  cyan: "#36D1FF",
} as const;
