import { createContext, useContext } from "react";

/**
 * Shared app-state context. Lives in its own module so that
 * TanStack Router's `?tsr-split=component` chunks all import the
 * SAME context instance — otherwise each split chunk gets its own
 * copy and `useContext` returns null.
 */

export type AppStep =
  | "welcome"
  | "wizard"
  | "transmission"
  | "portal"
  | "gameplay"
  | "kingdom"
  | "recommendation";

export type Career =
  | "business"
  | "engineering"
  | "technology"
  | "medicine"
  | "creative";

export type CareerScores = Record<Career, number>;

export type RunResult = {
  studentName: string;
  grade: number;
  scores: CareerScores;
  recommended: Career;
  chosenIsland?: Career;
};

export type AppStateValue = {
  currentStep: AppStep;
  setCurrentStep: (s: AppStep) => void;
  explorerName: string;
  grade: number;
  runResult: RunResult | null;
  setRunResult: (r: RunResult) => void;
};

export const AppStateContext = createContext<AppStateValue | null>(null);

export const useAppState = (): AppStateValue => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside <CareerQuest />");
  return ctx;
};
