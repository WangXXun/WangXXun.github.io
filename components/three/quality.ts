import { createContext, useContext } from "react";

export type Tier = "high" | "mid" | "low";
export const QualityContext = createContext<Tier>("high");
export const useTier = () => useContext(QualityContext);
