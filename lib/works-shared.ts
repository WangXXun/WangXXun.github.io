export const CATEGORIES = ["design", "build", "city", "evaluate", "reconstruct", "embody"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface WorkMeta {
  slug: string;
  title: string;
  year: string;
  category: Category;
  role?: string;
  place?: string;
  collaborators?: string;
  featured: boolean;
  order: number;
  cover?: string;
}
