import { createFileRoute } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  GraduationCap,
  Sparkles,
  Upload,
  User2,
  Trees,
  Mountain,
  Check,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Scroll,
  Feather,
  Key,
  Map,
  Footprints,
  Flame,
  Star,
  Code2,
  Palette,
  Stethoscope,
  Coins,
  Trophy,
  Activity,
  X,
  Brain,
  Building2,
  Cog,
  Cpu,
  HeartPulse,
  Wand2,
  HelpCircle,
  Lightbulb,
  ShoppingCart,
  Truck,
  Coffee,
  Rocket,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  MessageCircle,
  RefreshCw,
  Award,
} from "lucide-react";

/* Global app state lives in a shared module so route-split chunks see
   the SAME React Context instance. See src/lib/app-state.tsx. */
import {
  AppStateContext,
  useAppState,
  type AppStateValue,
  type AppStep,
  type Career,
  type CareerScores,
  type RunResult,
} from "@/lib/app-state";

import islandBusinessAsset from "@/assets/island-business.png.asset.json";
import islandEngineeringAsset from "@/assets/island-engineering.png.asset.json";

import { api, hasVideo, type Challenge, type FeedbackResponse, type PortalAnswerRecord, type PortalQuestionOption, type PortalQuestionResponse, type RunCompleteResponse, type RunDebriefResponse } from "@/lib/api";
import { MentorVideo } from "@/components/mentor-video";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerQuest — Begin the Expedition" },
      {
        name: "description",
        content:
          "An AI-powered career discovery game for students. Don't guess your future — adventure into it.",
      },
      { property: "og:title", content: "CareerQuest — Begin the Expedition" },
      {
        property: "og:description",
        content:
          "Grab your compass. Your Discovery Run begins now.",
      },
    ],
  }),
  component: CareerQuest,
});

function CareerQuest() {
  // 🌍 Global state manager — single source of truth for the whole flow.
  const [currentStep, setCurrentStep] = useState<AppStep>("welcome");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<number | null>(8);
  const [age, setAge] = useState(14);
  const [file, setFile] = useState<File | null>(null);

  // Mock side-effect: log every step transition (acts like a tiny event bus).
  useEffect(() => {
    console.info("[CareerQuest] currentStep →", currentStep);
  }, [currentStep]);

  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const value = useMemo<AppStateValue>(
    () => ({
      currentStep,
      setCurrentStep,
      explorerName: name || "Explorer",
      grade: grade ?? 8,
      runResult,
      setRunResult,
    }),
    [currentStep, name, grade, runResult],
  );

  return (
    <AppStateContext.Provider value={value}>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <AnimatePresence mode="wait">
          {currentStep === "welcome" && (
            <Welcome key="w" onBegin={() => setCurrentStep("wizard")} />
          )}
          {currentStep === "wizard" && (
            <Wizard
              key="z"
              name={name}
              setName={setName}
              grade={grade}
              setGrade={setGrade}
              age={age}
              setAge={setAge}
              file={file}
              setFile={setFile}
              onBack={() => setCurrentStep("welcome")}
              onComplete={() => setCurrentStep("transmission")}
            />
          )}
          {currentStep === "transmission" && (
            <Transmission
              key="t"
              name={name || "Explorer"}
              onLaunch={() => setCurrentStep("portal")}
            />
          )}
          {currentStep === "portal" && (
            <Portal
              key="p"
              name={name || "Explorer"}
              onEnter={() => setCurrentStep("gameplay")}
            />
          )}
          {currentStep === "gameplay" && <Gameplay key="g" />}
          {currentStep === "kingdom" && <BusinessKingdom key="k" />}
          {currentStep === "recommendation" && <Recommendation key="r" />}
        </AnimatePresence>
      </main>
    </AppStateContext.Provider>
  );
}

/* ============================================================
   Reusable chunky 3D button (Jumanji-style)
   ============================================================ */
function ChunkyButton({
  children,
  onClick,
  variant = "gold",
  className = "",
  disabled = false,
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "gold" | "emerald" | "wood";
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const palettes = {
    gold: {
      bg: "bg-gradient-gold",
      border: "border-[oklch(0.42_0.13_50)]",
      shadow: "shadow-chunk-gold",
      text: "text-[oklch(0.25_0.08_50)]",
    },
    emerald: {
      bg: "bg-gradient-emerald",
      border: "border-[oklch(0.32_0.1_150)]",
      shadow: "shadow-chunk-emerald",
      text: "text-white",
    },
    wood: {
      bg: "bg-gradient-wood",
      border: "border-[oklch(0.25_0.08_45)]",
      shadow: "shadow-chunk",
      text: "text-[oklch(0.95_0.05_85)]",
    },
  } as const;
  const p = palettes[variant];
  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3.5 text-base",
    lg: "px-9 py-4 text-lg",
  };
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { y: 4, boxShadow: "0 2px 0 0 oklch(0.32 0.08 45)" }}
      whileHover={disabled ? {} : { y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`font-display relative inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] uppercase tracking-wide ${p.bg} ${p.border} ${p.shadow} ${p.text} ${sizes[size]} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
      style={{
        textShadow: "0 2px 0 rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.35) inset",
      }}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/25 blur-[2px]" />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

/* ============================================================
   Carved wooden ribbon header (Jumanji "NOTIFICATIONS" plate)
   ============================================================ */
function RibbonHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto -mb-4 inline-block">
      <div className="ribbon-gold relative px-8 py-2.5">
        <span
          className="font-display text-xl tracking-wider text-[oklch(0.25_0.08_50)] sm:text-2xl"
          style={{ textShadow: "0 2px 0 rgba(255,255,255,0.5)" }}
        >
          {children}
        </span>
        {/* ribbon end-tails */}
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rotate-45 bg-[oklch(0.55_0.14_55)] [clip-path:polygon(0_50%,50%_0,50%_100%)]" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 -rotate-45 bg-[oklch(0.55_0.14_55)] [clip-path:polygon(50%_0,100%_50%,50%_100%)]" />
      </div>
    </div>
  );
}

/* ---------------- WELCOME ---------------- */

function Welcome({ onBegin }: { onBegin: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-jungle jungle-speckle relative flex min-h-screen items-center justify-center px-6 py-16"
    >
      <FloatingMotifs />
      {/* canopy vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[oklch(0.16_0.05_160)] to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <RibbonHeader>Season 01 · Expedition Open</RibbonHeader>
        </motion.div>

        <motion.h1
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-balance text-6xl leading-[0.95] text-[oklch(0.95_0.1_85)] sm:text-7xl md:text-8xl"
          style={{
            textShadow:
              "0 4px 0 oklch(0.4 0.13 55), 0 8px 0 oklch(0.3 0.1 50), 0 14px 30px rgba(0,0,0,0.5)",
          }}
        >
          CAREER<span className="text-[oklch(0.85_0.16_75)]">QUEST</span>
        </motion.h1>

        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="font-serif-quest text-balance mt-6 max-w-xl text-lg italic leading-relaxed text-[oklch(0.9_0.04_80)]/90"
        >
          Schools teach subjects — the jungle teaches who you are.{" "}
          <span className="font-semibold not-italic text-[oklch(0.88_0.15_80)]">
            Don't guess your future. Adventure into it.
          </span>
        </motion.p>

        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <ChunkyButton onClick={onBegin} variant="gold" size="lg">
            <Compass className="h-5 w-5" />
            Begin the Quest
            <ArrowRight className="h-5 w-5" />
          </ChunkyButton>
          <p className="font-serif-quest text-sm italic text-[oklch(0.88_0.04_85)]/70">
            ~ 3 minute expedition · progress saves automatically ~
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-3"
        >
          {[
            { k: "12K+", v: "Explorers" },
            { k: "230", v: "Career biomes" },
            { k: "AI", v: "Mentor guide" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border-2 border-[oklch(0.45_0.1_55)] bg-[oklch(0.18_0.05_160)]/70 px-4 py-3 backdrop-blur-sm"
              style={{ boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.1)" }}
            >
              <div className="font-display text-2xl text-[oklch(0.88_0.15_80)]">
                {s.k}
              </div>
              <div className="font-serif-quest mt-0.5 text-xs uppercase tracking-widest text-[oklch(0.88_0.04_85)]/70">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function FloatingMotifs() {
  const items = [
    { Icon: Trees, top: "10%", left: "6%", delay: 0, size: "h-16 w-16" },
    { Icon: Mountain, top: "18%", right: "8%", delay: 0.4, size: "h-14 w-14" },
    { Icon: Sparkles, bottom: "22%", left: "12%", delay: 0.8, size: "h-10 w-10" },
    { Icon: Map, bottom: "14%", right: "14%", delay: 1.2, size: "h-12 w-12" },
    { Icon: Feather, top: "40%", left: "4%", delay: 0.6, size: "h-8 w-8" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(({ Icon, delay, size, ...pos }, i) => (
        <motion.div
          key={i}
          style={pos as React.CSSProperties}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay, duration: 1.2 }}
          className="absolute float-soft"
        >
          <Icon className={`${size} text-[oklch(0.75_0.12_85)]/60`} strokeWidth={1.6} />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- WIZARD ---------------- */

type WizardProps = {
  name: string;
  setName: (v: string) => void;
  grade: number | null;
  setGrade: (v: number) => void;
  age: number;
  setAge: (v: number) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  onBack: () => void;
  onComplete: () => void;
};

function Wizard(props: WizardProps) {
  const [step, setStep] = useState(0);
  const steps = useMemo(
    () => [
      { label: "Name", icon: User2 },
      { label: "Grade", icon: GraduationCap },
      { label: "Age", icon: Sparkles },
      { label: "Scroll", icon: ScrollText },
    ],
    [],
  );

  const canNext = useMemo(() => {
    if (step === 0) return props.name.trim().length >= 2;
    if (step === 1) return props.grade !== null;
    if (step === 2) return props.age >= 8 && props.age <= 22;
    return true; // step 3 optional
  }, [step, props.name, props.grade, props.age]);

  const next = () => {
    if (step < 3) setStep(step + 1);
    else props.onComplete();
  };
  const prev = () => (step === 0 ? props.onBack() : setStep(step - 1));

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-jungle jungle-speckle relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={prev}
            className="font-display inline-flex items-center gap-1.5 rounded-xl border-2 border-[oklch(0.4_0.1_55)] bg-gradient-wood px-4 py-2 text-sm uppercase tracking-wide text-[oklch(0.95_0.05_85)] shadow-chunk"
            style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="font-serif-quest text-sm italic tracking-wide text-[oklch(0.88_0.08_80)]">
            Chapter {step + 1} of 4
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center justify-between gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  animate={{ scale: active ? 1.1 : 1 }}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] transition-all ${
                    active
                      ? "border-[oklch(0.42_0.13_50)] bg-gradient-gold text-[oklch(0.25_0.08_50)] shadow-chunk-gold"
                      : done
                        ? "border-[oklch(0.32_0.1_150)] bg-gradient-emerald text-white shadow-chunk-emerald"
                        : "border-[oklch(0.4_0.1_55)] bg-gradient-wood text-[oklch(0.85_0.06_85)]/60"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                </motion.div>
                <span
                  className={`font-display text-[10px] uppercase tracking-widest ${
                    active || done
                      ? "text-[oklch(0.95_0.1_85)]"
                      : "text-[oklch(0.88_0.04_85)]/50"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Parchment card */}
        <motion.div
          layout
          className="parchment shadow-parchment relative overflow-hidden rounded-[28px]"
        >
          {/* torn-edge corners (4 carved studs) */}
          {[
            "left-3 top-3",
            "right-3 top-3",
            "bottom-3 left-3",
            "bottom-3 right-3",
          ].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} h-3 w-3 rounded-full bg-[oklch(0.45_0.13_55)] shadow-[inset_0_-1px_0_oklch(0.25_0.08_45),0_1px_0_oklch(1_0_0/0.4)]`}
            />
          ))}

          <div className="relative p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 && <StepIdentity name={props.name} setName={props.setName} />}
                {step === 1 && <StepGrade grade={props.grade} setGrade={props.setGrade} />}
                {step === 2 && <StepAge age={props.age} setAge={props.setAge} />}
                {step === 3 && <StepPortal file={props.file} setFile={props.setFile} />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-4 border-t-2 border-dashed border-[oklch(0.6_0.08_55)]/40 pt-5">
              <div className="font-serif-quest text-xs italic text-[oklch(0.4_0.06_55)]">
                {step === 3
                  ? "You may skip the scroll — adventure continues either way."
                  : "Required for the journey ahead"}
              </div>
              <ChunkyButton
                onClick={next}
                variant={step === 3 ? "emerald" : "gold"}
                disabled={!canNext}
                size="md"
              >
                {step === 3 ? "Summon Mentor" : step === 2 ? "Almost There" : "Onward"}
                <ArrowRight className="h-4 w-4" />
              </ChunkyButton>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function StepHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="font-display mb-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[oklch(0.55_0.14_55)] bg-[oklch(0.85_0.1_80)] px-3 py-1 text-[10px] uppercase tracking-widest text-[oklch(0.3_0.08_50)]">
        <Feather className="h-3 w-3" />
        {badge}
      </div>
      <h2 className="font-display text-3xl text-[oklch(0.25_0.08_50)] sm:text-4xl">
        {title}
      </h2>
      <p className="font-serif-quest mt-2 text-base italic text-[oklch(0.4_0.06_55)]">
        {subtitle}
      </p>
    </div>
  );
}

function StepIdentity({ name, setName }: { name: string; setName: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        badge="Chapter I · Your Name"
        title="What shall the jungle call you?"
        subtitle="Inscribe your name — your mentor will whisper it across every trail."
      />
      <div className="relative">
        <div className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-[oklch(0.42_0.13_50)] bg-gradient-gold text-[oklch(0.25_0.08_50)] shadow-chunk-gold">
          <Feather className="h-4 w-4" />
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aria the Pathfinder"
          className="font-serif-quest w-full rounded-2xl border-[3px] border-[oklch(0.55_0.1_55)] bg-[oklch(0.96_0.04_85)]/80 py-4 pl-16 pr-4 text-xl text-[oklch(0.25_0.08_50)] outline-none transition-all placeholder:italic placeholder:text-[oklch(0.55_0.08_55)]/50 focus:border-[oklch(0.42_0.13_50)] focus:shadow-chunk-gold"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="font-serif-quest text-xs italic text-[oklch(0.4_0.06_55)]">
          Need a spark?
        </span>
        {["Aria", "Kairo", "Nova", "Finch", "Onyx"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setName(suggestion)}
            className="font-display rounded-full border-2 border-[oklch(0.5_0.1_55)] bg-[oklch(0.9_0.06_80)] px-3 py-1 text-xs uppercase tracking-wide text-[oklch(0.3_0.08_50)] transition hover:bg-[oklch(0.85_0.12_80)]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGrade({
  grade,
  setGrade,
}: {
  grade: number | null;
  setGrade: (v: number) => void;
}) {
  const grades = [6, 7, 8, 9, 10, 11, 12];
  return (
    <div>
      <StepHeader
        badge="Chapter II · Your Tier"
        title="Which rung of the temple?"
        subtitle="We calibrate the trail by your current grade — every climber begins somewhere."
      />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {grades.map((g) => {
          const active = grade === g;
          return (
            <motion.button
              key={g}
              onClick={() => setGrade(g)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              className={`relative aspect-square overflow-hidden rounded-2xl border-[3px] p-3 text-left transition-all ${
                active
                  ? "border-[oklch(0.42_0.13_50)] bg-gradient-gold text-[oklch(0.25_0.08_50)] shadow-chunk-gold"
                  : "border-[oklch(0.55_0.1_55)] bg-[oklch(0.9_0.05_80)] text-[oklch(0.3_0.08_50)] hover:bg-[oklch(0.85_0.08_80)]"
              }`}
            >
              <div className="font-display text-[10px] uppercase tracking-widest opacity-80">
                Grade
              </div>
              <div
                className="font-display mt-1 text-4xl leading-none"
                style={{ textShadow: active ? "0 2px 0 oklch(0.5 0.14 55 / 0.5)" : "none" }}
              >
                {g}
              </div>
              {active && (
                <motion.div
                  layoutId="grade-check"
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[oklch(0.42_0.13_50)] bg-white text-[oklch(0.42_0.13_50)]"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StepAge({ age, setAge }: { age: number; setAge: (v: number) => void }) {
  const min = 8;
  const max = 22;
  const pct = ((age - min) / (max - min)) * 100;
  return (
    <div>
      <StepHeader
        badge="Chapter III · Your Years"
        title="How many seasons have you wandered?"
        subtitle="Slide the dial — the mentor scales challenges to your years."
      />
      <div className="rounded-2xl border-2 border-[oklch(0.55_0.1_55)] bg-[oklch(0.9_0.05_80)]/60 p-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="font-serif-quest text-xs uppercase tracking-widest text-[oklch(0.4_0.06_55)]">
              Age
            </div>
            <div
              className="font-display flex items-baseline gap-2 text-6xl text-[oklch(0.25_0.08_50)]"
              style={{ textShadow: "0 3px 0 oklch(0.55 0.13 55 / 0.4)" }}
            >
              {age}
              <span className="font-serif-quest text-base italic text-[oklch(0.4_0.06_55)]">
                seasons
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAge(Math.max(min, age - 1))}
              className="font-display h-11 w-11 rounded-xl border-2 border-[oklch(0.42_0.13_50)] bg-gradient-gold text-2xl text-[oklch(0.25_0.08_50)] shadow-chunk-gold"
            >
              −
            </button>
            <button
              onClick={() => setAge(Math.min(max, age + 1))}
              className="font-display h-11 w-11 rounded-xl border-2 border-[oklch(0.42_0.13_50)] bg-gradient-gold text-2xl text-[oklch(0.25_0.08_50)] shadow-chunk-gold"
            >
              +
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="quest-slider w-full"
            style={{ ["--pct" as string]: `${pct}%` } as React.CSSProperties}
          />
          <div className="font-serif-quest mt-3 flex justify-between text-[11px] italic text-[oklch(0.4_0.06_55)]">
            <span>{min}</span>
            <span>15</span>
            <span>{max}</span>
          </div>
        </div>

        <style>{`
          .quest-slider {
            -webkit-appearance: none; appearance: none;
            height: 14px; border-radius: 999px;
            background: linear-gradient(to right,
              oklch(0.78 0.16 75) 0%,
              oklch(0.62 0.16 60) var(--pct),
              oklch(0.7 0.08 55 / 0.4) var(--pct),
              oklch(0.7 0.08 55 / 0.4) 100%);
            border: 2px solid oklch(0.5 0.1 55);
            box-shadow: inset 0 2px 4px oklch(0.3 0.08 50 / 0.4);
            outline: none;
          }
          .quest-slider::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 30px; height: 30px; border-radius: 999px;
            background: radial-gradient(circle at 30% 30%, oklch(0.95 0.1 90), oklch(0.7 0.17 65));
            border: 3px solid oklch(0.42 0.13 50);
            box-shadow: 0 4px 0 oklch(0.35 0.1 45), 0 6px 14px -2px oklch(0.3 0.1 50 / 0.5);
            cursor: grab;
          }
          .quest-slider::-webkit-slider-thumb:active { transform: translateY(2px); cursor: grabbing; }
          .quest-slider::-moz-range-thumb {
            width: 30px; height: 30px; border-radius: 999px;
            background: radial-gradient(circle at 30% 30%, oklch(0.95 0.1 90), oklch(0.7 0.17 65));
            border: 3px solid oklch(0.42 0.13 50);
            box-shadow: 0 4px 0 oklch(0.35 0.1 45);
            cursor: grab;
          }
        `}</style>
      </div>
    </div>
  );
}

function StepPortal({
  file,
  setFile,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) setFile(f);
    },
    [setFile],
  );

  return (
    <div>
      {/* HUGE optional banner */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-dashed border-[oklch(0.55_0.14_55)] bg-[oklch(0.9_0.1_80)]/70 px-4 py-3">
        <span
          className="font-display rounded-lg border-2 border-[oklch(0.42_0.13_50)] bg-gradient-gold px-3 py-1 text-sm uppercase tracking-widest text-[oklch(0.22_0.08_50)] shadow-chunk-gold"
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
        >
          Optional
        </span>
        <span className="font-serif-quest text-sm italic text-[oklch(0.35_0.07_55)]">
          Skip freely — your adventure begins either way.
        </span>
      </div>

      <StepHeader
        badge="Chapter IV · Parent's Scroll"
        title="Drop a transcript (if you wish)"
        subtitle="Upload a report card and the mentor will hand-draw a map matched to your strengths."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-[3px] border-dashed px-6 py-10 text-center transition-all ${
          dragging
            ? "scale-[1.01] border-[oklch(0.42_0.13_50)] bg-[oklch(0.88_0.12_80)]/70"
            : "border-[oklch(0.55_0.1_55)] bg-[oklch(0.93_0.05_82)]/60 hover:border-[oklch(0.42_0.13_50)] hover:bg-[oklch(0.9_0.08_80)]/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[oklch(0.32_0.1_150)] bg-gradient-emerald text-white shadow-chunk-emerald">
              <Check className="h-7 w-7" strokeWidth={3} />
            </div>
            <div className="font-display text-lg text-[oklch(0.25_0.08_50)]">{file.name}</div>
            <div className="font-serif-quest mt-1 text-sm italic text-[oklch(0.4_0.06_55)]">
              {(file.size / 1024).toFixed(1)} KB · sealed for the mentor
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="font-display mt-3 text-xs uppercase tracking-widest text-[oklch(0.5_0.16_55)] hover:underline"
            >
              Replace scroll
            </button>
          </div>
        ) : (
          <>
            <motion.div
              animate={{ y: dragging ? -4 : 0 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[oklch(0.42_0.13_50)] bg-gradient-gold text-[oklch(0.25_0.08_50)] shadow-chunk-gold"
            >
              <Upload className="h-7 w-7" />
            </motion.div>
            <div className="font-display text-xl text-[oklch(0.25_0.08_50)]">
              Drop your scroll here
            </div>
            <div className="font-serif-quest mt-1 text-base italic text-[oklch(0.4_0.06_55)]">
              or{" "}
              <span className="font-display not-italic uppercase tracking-wide text-[oklch(0.5_0.16_55)]">
                browse
              </span>{" "}
              your satchel · PDF · JPG · PNG
            </div>
          </>
        )}
      </div>

      <p className="font-serif-quest mt-4 text-center text-xs italic text-[oklch(0.4_0.06_55)]">
        🔒 Sealed in transit. Read only by your mentor — never traded in the bazaar.
      </p>
    </div>
  );
}

/* ---------------- TRANSMISSION (scripted AI guide welcome — no live video) ---------------- */

const TRANSCRIPT_LINES = [
  { text: "Welcome back, {{name}}.", duration: 2600 },
  { text: "Today's mission is to discover where your greatest strengths lie.", duration: 4200 },
  { text: "After your Discovery Run, your world mentor will meet you on live video to talk about how you did.", duration: 4800 },
  { text: "Let's begin your Discovery Run.", duration: 2800 },
];

function Transmission({ name, onLaunch }: { name: string; onLaunch: () => void }) {
  const displayName = name?.trim() || "Explorer";
  const lines = useMemo(
    () => TRANSCRIPT_LINES.map((l) => ({ ...l, text: l.text.replace("{{name}}", displayName) })),
    [displayName],
  );

  const [currentTranscriptLine, setCurrentTranscriptLine] = useState(0);
  const [allSpoken, setAllSpoken] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Advance transcript in sync with reading pace
  useEffect(() => {
    if (currentTranscriptLine < 0 || currentTranscriptLine >= lines.length) return;
    const dur = lines[currentTranscriptLine].duration;
    const t = window.setTimeout(() => {
      if (currentTranscriptLine + 1 >= lines.length) {
        setAllSpoken(true);
      } else {
        setCurrentTranscriptLine((i) => i + 1);
      }
    }, dur);
    return () => window.clearTimeout(t);
  }, [currentTranscriptLine, lines]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [currentTranscriptLine, allSpoken]);

  const canLaunch = allSpoken;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-jungle jungle-speckle relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 sm:py-14"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[oklch(0.15_0.05_165)] to-transparent" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <RibbonHeader>Step 2 · Meet Your AI Guide</RibbonHeader>
          </motion.div>
          <p className="font-serif-quest mt-3 text-base italic text-[oklch(0.92_0.04_85)]/85 sm:text-lg">
            Ruby welcomes you — live video comes after your Discovery Run
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* LEFT — Ruby portrait (scripted welcome, no Tavus) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div
              className="relative overflow-hidden rounded-[28px] border-[3px] border-[oklch(0.32_0.08_45)] bg-[oklch(0.12_0.03_160)] shadow-[0_30px_60px_-20px_oklch(0.1_0.04_160/0.7),inset_0_2px_0_oklch(1_0_0/0.08)]"
              style={{ aspectRatio: "4 / 5" }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/10" />

              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.78_0.05_75)_0%,oklch(0.62_0.06_60)_55%,oklch(0.42_0.05_50)_100%)]" />
                <div className="absolute inset-x-0 top-1/4 mx-auto h-40 w-64 rounded-md bg-[oklch(0.92_0.04_85)]/30 blur-2xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="mx-auto h-44 w-44 rounded-full bg-gradient-to-b from-[oklch(0.85_0.08_30)] to-[oklch(0.55_0.12_25)] shadow-[0_-10px_40px_oklch(0.3_0.1_30/0.4)]" />
                    <div className="-mt-6 h-56 w-72 rounded-t-[120px] bg-[oklch(0.35_0.08_260)] shadow-[inset_0_4px_0_oklch(1_0_0/0.1)]" />
                  </div>
                </div>
                {!allSpoken && (
                  <motion.div
                    className="absolute bottom-10 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-[oklch(0.78_0.16_75)]/70"
                    animate={{ scaleX: [1, 1.4, 0.9, 1.2, 1], opacity: [0.6, 1, 0.7, 0.95, 0.6] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                )}
                {allSpoken && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 backdrop-blur-sm"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] ring-4 ring-white/30">
                      <Check className="h-7 w-7 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-display text-xs uppercase tracking-[0.28em] text-white">
                      Welcome complete
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/15">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38BDF8] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8]" />
                </span>
                <span className="font-display text-[10px] uppercase tracking-[0.25em] text-white/90">
                  Guide Message
                </span>
              </div>

              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-black/55 px-3 py-2 backdrop-blur-md ring-1 ring-white/15">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.85_0.08_30)] to-[oklch(0.55_0.12_25)] text-white shadow-inner">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="font-display text-[9px] uppercase tracking-[0.25em] text-white/60">AI Guide</div>
                  <div className="font-display text-xs text-white">Ruby</div>
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-black/45 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-white/85">
                  <MessageCircle className="h-4 w-4" />
                  <div className="flex items-end gap-0.5">
                    {[5, 9, 6, 12, 8, 10, 7].map((h, i) => (
                      <motion.span
                        key={i}
                        className="block w-1 rounded-full bg-[#38BDF8]"
                        style={{ height: h }}
                        animate={
                          !allSpoken
                            ? { scaleY: [0.6, 1.6, 0.8, 1.4, 0.7] }
                            : { scaleY: 0.6 }
                        }
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.07 }}
                      />
                    ))}
                  </div>
                </div>
                <span className="font-display text-[10px] uppercase tracking-[0.25em] text-white/70">
                  Scripted welcome
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-center">
              <span className="font-display text-[10px] uppercase tracking-[0.3em] text-[oklch(0.85_0.06_85)]/70">
                Session #CQ-{displayName.slice(0, 3).toUpperCase()}-001 · Live mentor after the run
              </span>
            </div>
          </motion.div>

          {/* RIGHT — Transcript */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex flex-col"
          >
            <div className="parchment shadow-parchment relative flex flex-1 flex-col overflow-hidden rounded-[28px]">
              <div className="flex items-center justify-between border-b-2 border-dashed border-[oklch(0.6_0.08_55)]/40 px-6 py-4 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[oklch(0.42_0.13_50)] bg-gradient-gold shadow-chunk-gold">
                    <Feather className="h-5 w-5 text-[oklch(0.25_0.08_50)]" />
                  </div>
                  <div>
                    <div className="font-display text-[10px] uppercase tracking-[0.3em] text-[oklch(0.4_0.06_55)]">
                      Welcome Script · Ruby
                    </div>
                    <div className="font-display text-lg text-[oklch(0.25_0.08_50)]" style={{ textShadow: "0 2px 0 oklch(0.7 0.1 55 / 0.4)" }}>
                      Mentor Transmission
                    </div>
                  </div>
                </div>
                {!allSpoken && (
                  <div className="hidden items-center gap-1.5 rounded-full bg-[oklch(0.88_0.07_75)] px-2.5 py-1 ring-1 ring-[oklch(0.5_0.1_55)]/30 sm:flex">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                    </span>
                    <span className="font-display text-[9px] uppercase tracking-[0.25em] text-[oklch(0.3_0.08_55)]">
                      Reading
                    </span>
                  </div>
                )}
              </div>

              <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10" style={{ minHeight: "22rem", maxHeight: "28rem" }}>
                <div className="space-y-6">
                  {lines.map((line, i) => {
                    const visible = i <= currentTranscriptLine || allSpoken;
                    const active = i === currentTranscriptLine && !allSpoken;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: visible ? 1 : 0.15, y: visible ? 0 : 12 }}
                        transition={{ duration: 0.5 }}
                        className="relative pl-6"
                      >
                        <span
                          className={`absolute left-0 top-2 h-full w-[3px] rounded-full transition-colors ${
                            active ? "bg-[#22C55E] shadow-[0_0_12px_#22C55E]" : visible ? "bg-[oklch(0.6_0.08_55)]/40" : "bg-[oklch(0.6_0.08_55)]/20"
                          }`}
                        />
                        <div className="font-display text-[10px] uppercase tracking-[0.3em] text-[oklch(0.45_0.08_55)]">
                          Line {String(i + 1).padStart(2, "0")}
                        </div>
                        <p className="font-serif-quest mt-1 text-xl leading-relaxed text-[oklch(0.22_0.07_50)] sm:text-2xl" style={{ fontStyle: "italic" }}>
                          "{line.text}"
                          {active && <span className="ml-1 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-[oklch(0.35_0.1_50)]" />}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-stretch justify-between gap-4 border-t-2 border-dashed border-[oklch(0.6_0.08_55)]/40 bg-[oklch(0.91_0.05_80)]/60 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[oklch(0.4_0.1_50)]" />
                  <span className="font-serif-quest text-sm italic text-[oklch(0.35_0.08_55)]">
                    {allSpoken ? "Ruby has finished her welcome. The trail awaits." : "Read along — your guide is welcoming you…"}
                  </span>
                </div>
                <div className="flex justify-end">
                  <motion.div
                    animate={canLaunch ? { boxShadow: ["0 0 0px #22C55E", "0 0 28px #22C55E", "0 0 0px #22C55E"] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="rounded-2xl"
                  >
                    <ChunkyButton onClick={onLaunch} variant="emerald" size="lg" disabled={!canLaunch}>
                      <Key className="h-5 w-5" />
                      Enter Discovery Run
                      <ArrowRight className="h-5 w-5" />
                    </ChunkyButton>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}



function ScrollRod({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={`relative mx-0 h-5 rounded-full bg-gradient-wood ${
        position === "top" ? "mb-0" : "mt-0"
      }`}
      style={{
        boxShadow:
          "inset 0 2px 0 oklch(0.6 0.1 50 / 0.7), inset 0 -2px 0 oklch(0.2 0.06 45), 0 4px 12px oklch(0.2 0.05 45 / 0.4)",
      }}
    >
      <div className="absolute left-0 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[oklch(0.22_0.06_45)] bg-gradient-to-br from-[oklch(0.55_0.1_50)] to-[oklch(0.32_0.08_45)]" />
      <div className="absolute right-0 top-1/2 h-7 w-7 -translate-y-1/2 translate-x-1/2 rounded-full border-[3px] border-[oklch(0.22_0.06_45)] bg-gradient-to-br from-[oklch(0.55_0.1_50)] to-[oklch(0.32_0.08_45)]" />
    </div>
  );
}

/* ---------------- PORTAL LOADING ---------------- */

function Portal({ name, onEnter }: { name: string; onEnter: () => void }) {
  const [progress, setProgress] = useState(0);
  const ready = progress >= 100;

  useEffect(() => {
    if (ready) return;
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 6 + 2));
    }, 180);
    return () => window.clearInterval(id);
  }, [ready]);

  const messages = [
    "Sharpening the compass…",
    "Charting jungle biomes…",
    "Lighting the mentor's lantern…",
    "Unlocking your Discovery Run…",
  ];
  const msg = messages[Math.min(messages.length - 1, Math.floor(progress / 25))];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-jungle jungle-speckle relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[oklch(0.15_0.05_165)] to-transparent" />

      {/* expanding rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 3, delay: i * 0.75, repeat: Infinity, ease: "easeOut" }}
          className="absolute h-64 w-64 rounded-full border-[3px] border-[oklch(0.78_0.16_75)]/40"
        />
      ))}

      {/* central portal */}
      <div className="relative mb-12 flex h-64 w-64 items-center justify-center">
        <div className="bg-gradient-portal portal-spin absolute inset-0 rounded-full opacity-90 blur-md" />
        <div className="bg-gradient-portal portal-spin absolute inset-3 rounded-full" />
        <div className="absolute inset-7 rounded-full bg-[oklch(0.18_0.05_160)]" />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border-[4px] border-[oklch(0.32_0.1_150)] bg-gradient-emerald shadow-chunk-emerald"
        >
          <Compass className="h-14 w-14 text-white" strokeWidth={1.8} />
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-[oklch(0.88_0.15_80)]">
          The Portal Stirs
        </div>
        <h2
          className="font-display mt-2 text-3xl text-[oklch(0.95_0.1_85)] sm:text-4xl"
          style={{ textShadow: "0 3px 0 oklch(0.4 0.13 55), 0 8px 20px rgba(0,0,0,0.5)" }}
        >
          Opening for{" "}
          <span className="text-[oklch(0.85_0.16_75)]">{name}</span>
        </h2>

        {/* Adventure loading bar — chunky wood frame */}
        <div className="mt-8">
          <div
            className="relative h-7 rounded-2xl border-[3px] border-[oklch(0.22_0.06_45)] bg-gradient-wood p-1"
            style={{
              boxShadow:
                "inset 0 2px 4px oklch(0.15 0.05 45 / 0.7), 0 4px 0 oklch(0.18 0.05 45), 0 8px 18px oklch(0.1 0.04 45 / 0.5)",
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-gold relative h-full rounded-xl"
              style={{
                boxShadow:
                  "inset 0 2px 0 oklch(1 0 0 / 0.5), inset 0 -2px 0 oklch(0.5 0.14 55 / 0.6), 0 0 12px oklch(0.78 0.16 75 / 0.6)",
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </div>
            </motion.div>
          </div>
          <div className="font-display mt-3 flex justify-between text-xs uppercase tracking-widest text-[oklch(0.9_0.06_85)]/80">
            <span className="font-serif-quest text-sm italic normal-case tracking-normal">
              {msg}
            </span>
            <span className="text-[oklch(0.88_0.15_80)]">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* Final transition button — flips global currentStep to "gameplay" */}
        <motion.div
          initial={false}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 14 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex justify-center"
        >
          <ChunkyButton
            onClick={ready ? onEnter : undefined}
            variant="gold"
            size="lg"
            disabled={!ready}
          >
            <Footprints className="h-5 w-5" />
            Begin Discovery Run
            <ArrowRight className="h-5 w-5" />
          </ChunkyButton>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ============================================================
   GAMEPLAY — "CareerRun: The Discovery Run"
   Vertical pseudo-3D lane runner with 5 Career World portals.
   Palette: #22C55E / #38BDF8 / #FBBF24 / bg #F8FAFC / text #1E293B
   ============================================================ */

const CAREER_META: Record<
  Career,
  {
    label: string;
    short: string;
    color: string;
    ring: string;
    glow: string;
    Icon: typeof Code2;
    emoji: string;
    island: string;
  }
> = {
  business: {
    label: "Business Kingdom",
    short: "Business",
    color: "#FBBF24",
    ring: "rgba(251,191,36,0.55)",
    glow: "0 0 28px rgba(251,191,36,0.85)",
    Icon: Building2,
    emoji: "🏢",
    island: "Sun-Coin Atoll",
  },
  engineering: {
    label: "Engineering City",
    short: "Engineering",
    color: "#F97316",
    ring: "rgba(249,115,22,0.5)",
    glow: "0 0 28px rgba(249,115,22,0.8)",
    Icon: Cog,
    emoji: "⚙️",
    island: "Iron-Gear Peaks",
  },
  technology: {
    label: "Technology Lab",
    short: "Technology",
    color: "#38BDF8",
    ring: "rgba(56,189,248,0.55)",
    glow: "0 0 28px rgba(56,189,248,0.85)",
    Icon: Cpu,
    emoji: "💻",
    island: "Neon Circuit Isle",
  },
  medicine: {
    label: "Medical Academy",
    short: "Medicine",
    color: "#22C55E",
    ring: "rgba(34,197,94,0.55)",
    glow: "0 0 28px rgba(34,197,94,0.85)",
    Icon: HeartPulse,
    emoji: "🩺",
    island: "Aurora Apothecary",
  },
  creative: {
    label: "Creative Universe",
    short: "Creative",
    color: "#EC4899",
    ring: "rgba(236,72,153,0.55)",
    glow: "0 0 28px rgba(236,72,153,0.85)",
    Icon: Wand2,
    emoji: "🎨",
    island: "Prism Atelier",
  },
};

const CAREER_ORDER: Career[] = [
  "business",
  "engineering",
  "technology",
  "medicine",
  "creative",
];

type Portal = { id: number; career: Career; lane: 0 | 1 | 2; y: number };
type Pickup = { id: number; career: Career; lane: 0 | 1 | 2; y: number };

const LANE_LEFT = ["16.6%", "50%", "83.3%"] as const;
const TRACK_HEIGHT_VH = 72;

/* ============================================================
   GAMEPLAY — Horizontal Discovery Run with strict 5-correct gate
   ============================================================ */


const ISLAND_IMG: Record<Career, string | null> = {
  business: islandBusinessAsset.url,
  engineering: islandEngineeringAsset.url,
  technology: null,
  medicine: null,
  creative: null,
};

const ISLAND_FALLBACK_BG: Record<Career, string> = {
  business: "linear-gradient(180deg,#FBBF24 0%,#F59E0B 60%,#7C2D12 100%)",
  engineering: "linear-gradient(180deg,#F97316 0%,#9A3412 60%,#1C1917 100%)",
  technology: "linear-gradient(180deg,#38BDF8 0%,#0EA5E9 50%,#1E3A8A 100%)",
  medicine: "linear-gradient(180deg,#22C55E 0%,#10B981 55%,#064E3B 100%)",
  creative: "linear-gradient(180deg,#EC4899 0%,#A855F7 55%,#581C87 100%)",
};

const REQUIRED_CORRECT = 5;
const TOTAL_PORTALS = 5;

type ActivePortalChallenge = {
  career: Career;
  loading: boolean;
  data: PortalQuestionResponse | null;
  error?: boolean;
};

function Gameplay() {
  const { explorerName, grade, setCurrentStep, setRunResult } = useAppState();

  const [lane, setLane] = useState<0 | 1 | 2>(1); // 0=left 1=center 2=right
  const [phase, setPhase] = useState<"intro" | "running" | "hub" | "failed" | "debrief">("intro");
  const [portalQueue, setPortalQueue] = useState<Career[]>(() => [...CAREER_ORDER]);
  const [activePortal, setActivePortal] = useState<Portal | null>(null);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [cleared, setCleared] = useState<Career[]>([]);
  const [challenge, setChallenge] = useState<ActivePortalChallenge | null>(null);
  const [portalAnswers, setPortalAnswers] = useState<PortalAnswerRecord[]>([]);
  const [scores, setScores] = useState<CareerScores>({
    business: 0, engineering: 0, technology: 0, medicine: 0, creative: 0,
  });
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [distance, setDistance] = useState(0);
  const [hint, setHint] = useState("Approaching Career Portals…");
  const [flash, setFlash] = useState<{ id: number; career: Career; lane: 0 | 1 | 2; correct?: boolean } | null>(null);

  const idRef = useRef(0);
  const laneRef = useRef(lane); laneRef.current = lane;
  const pausedRef = useRef(false);
  pausedRef.current = phase !== "running" || !!challenge;
  const spawnCooldownRef = useRef(0);
  const portalCooldownRef = useRef(900);
  const usedQuestionIdsRef = useRef<string[]>([]);
  const gradeRef = useRef(grade);
  gradeRef.current = grade;

  const loadPortalQuestion = useCallback((career: Career) => {
    setChallenge({ career, loading: true, data: null });
    api
      .getPortalQuestion(career, gradeRef.current, usedQuestionIdsRef.current)
      .then((data) => {
        usedQuestionIdsRef.current.push(data.question.id);
        setChallenge({ career, loading: false, data });
      })
      .catch(() => {
        setChallenge({ career, loading: false, data: null, error: true });
      });
  }, []);

  // intro→running
  useEffect(() => {
    if (phase !== "intro") return;
    const t = window.setTimeout(() => setPhase("running"), 2200);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Keyboard left/right for vertical Temple Run-style lanes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setLane((l) => (l > 0 ? ((l - 1) as 0 | 1 | 2) : l));
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setLane((l) => (l < 2 ? ((l + 1) as 0 | 1 | 2) : l));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activePortalRef = useRef<Portal | null>(null); activePortalRef.current = activePortal;
  const portalQueueRef = useRef<Career[]>(portalQueue); portalQueueRef.current = portalQueue;

  // Main tick. y becomes "x" progress (0=spawn right, 100=at player)
  useEffect(() => {
    if (phase !== "running") return;
    const TICK = 50;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setDistance((d) => d + 1);

      setActivePortal((p) => {
        if (!p) return p;
        const next = { ...p, y: p.y + 1.3 };
        if (next.y >= 86) {
          loadPortalQuestion(next.career);
          setHint(`Entering ${CAREER_META[next.career].label}…`);
          return null;
        }
        return next;
      });

      if (!activePortalRef.current && portalCooldownRef.current <= 0) {
        if (portalQueueRef.current.length > 0) {
          const [head, ...rest] = portalQueueRef.current;
          if (head) {
            idRef.current += 1;
            setActivePortal({
              id: idRef.current, career: head,
              lane: Math.floor(Math.random() * 3) as 0 | 1 | 2, y: -10,
            });
            setPortalQueue(rest);
            setHint(`Approaching ${CAREER_META[head].label}…`);
            portalCooldownRef.current = 1200;
          }
        }
      } else {
        portalCooldownRef.current = Math.max(0, portalCooldownRef.current - TICK);
      }

      setPickups((prev) => {
        const moved = prev.map((c) => ({ ...c, y: c.y + 3.4 }));
        const remaining: Pickup[] = [];
        for (const c of moved) {
          if (c.y >= 84 && c.y <= 96 && c.lane === laneRef.current) {
            // STRICT GATE: pickups animate only, do NOT award score points
            setFlash({ id: c.id, career: c.career, lane: c.lane });
            window.setTimeout(() => setFlash(null), 280);
            continue;
          }
          if (c.y > 110) continue;
          remaining.push(c);
        }
        return remaining;
      });

      spawnCooldownRef.current -= TICK;
      if (spawnCooldownRef.current <= 0) {
        spawnCooldownRef.current = 380 + Math.random() * 240;
        const ap = activePortalRef.current;
        const careerPool: Career[] = ap && Math.random() < 0.65 ? [ap.career] : CAREER_ORDER;
        const career = careerPool[Math.floor(Math.random() * careerPool.length)]!;
        idRef.current += 1;
        setPickups((prev) => [...prev, {
          id: idRef.current, career,
          lane: Math.floor(Math.random() * 3) as 0 | 1 | 2, y: -6,
        }]);
      }
    }, TICK);
    return () => window.clearInterval(id);
  }, [phase, loadPortalQuestion]);

  // End of run — always show the AI mentor debrief (video + text feedback +
  // Career Compass). The debrief itself decides what to do next based on
  // whether the student cleared the gate.
  useEffect(() => {
    if (phase === "running" && cleared.length === TOTAL_PORTALS && !activePortal && !challenge) {
      const t = window.setTimeout(() => setPhase("debrief"), 700);
      return () => window.clearTimeout(t);
    }
  }, [cleared, phase, activePortal, challenge]);

  const answerChallenge = (option: PortalQuestionOption) => {
    if (!challenge?.data) return;
    const c = challenge.career;
    const q = challenge.data;
    const positive = option.isStrongChoice;

    setPortalAnswers((prev) => [
      ...prev,
      {
        world: c,
        questionId: q.question.id,
        questionText: q.question.text,
        answerLabel: option.label,
        answerText: option.text,
        level: q.level,
        theme: q.theme,
        positive,
      },
    ]);

    if (positive) {
      setScores((s) => ({ ...s, [c]: s[c] + 20 }));
      setCorrectAnswersCount((n) => n + 1);
    } else {
      setScores((s) => ({ ...s, [c]: Math.max(s[c], 5) }));
    }
    setCleared((prev) => (prev.includes(c) ? prev : [...prev, c]));
    setChallenge(null);
    setFlash({ id: Date.now(), career: c, lane: laneRef.current, correct: positive });
    window.setTimeout(() => setFlash(null), 600);
    setHint(positive ? "Strong instinct! Path advancing…" : "Interesting choice — keep running…");
    portalCooldownRef.current = 700;
  };

  const retryRun = () => {
    setLane(1); setPortalQueue([...CAREER_ORDER]); setActivePortal(null);
    setPickups([]); setCleared([]); setChallenge(null); setPortalAnswers([]);
    usedQuestionIdsRef.current = [];
    setScores({ business: 0, engineering: 0, technology: 0, medicine: 0, creative: 0 });
    setCorrectAnswersCount(0); setDistance(0); setHint("Approaching Career Portals…");
    portalCooldownRef.current = 900; setPhase("intro");
  };

  const chooseIsland = (career: Career) => {
    const recommended =
      (Object.keys(scores) as Career[]).reduce((a, b) => (scores[a] >= scores[b] ? a : b)) ?? career;
    const result: RunResult = {
      studentName: explorerName, grade, scores, recommended, chosenIsland: career,
    };
    setRunResult(result);
    if (career === "business") {
      setCurrentStep("kingdom");
    } else {
      setCurrentStep("recommendation");
    }
  };

  const totalScore = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
  const progress = cleared.length / TOTAL_PORTALS;
  const postRunPhase = phase === "debrief" || phase === "hub";

  return (
    <motion.section
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen flex-col items-center px-3 py-4 sm:px-6 sm:py-6"
      style={{
        background: postRunPhase
          ? "#F8FAFC"
          : "linear-gradient(180deg, #0F172A 0%, #134E4A 35%, #064E3B 100%)",
        color: postRunPhase ? "#1E293B" : "#F8FAFC",
      }}
    >
      {!postRunPhase && (
        <>
      <ArcadeHUD
        name={explorerName} distance={distance} totalScore={totalScore}
        cleared={cleared} progress={progress}
        correctAnswers={correctAnswersCount} required={REQUIRED_CORRECT}
      />

      {/* VERTICAL TRACK — Temple Run-style phone canvas */}
      <div
        className="relative mx-auto mt-3 w-full max-w-[420px] overflow-hidden rounded-[32px] border-[5px]"
        style={{
          aspectRatio: "9 / 16",
          maxHeight: "min(78vh, 760px)",
          borderColor: "#FBBF24",
          boxShadow: "0 0 0 4px #1E293B, 0 28px 60px -12px rgba(0,0,0,0.65), inset 0 0 80px rgba(251,191,36,0.08)",
          background: "linear-gradient(180deg, #38BDF8 0%, #7DD3FC 18%, #86EFAC 42%, #166534 43%, #14532D 100%)",
        }}
      >
        {/* Sky + distant jungle canopy */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[42%]">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute right-6 top-5 h-14 w-14 rounded-full"
            style={{
              background: "radial-gradient(circle,#FDE68A 0%,#FBBF24 65%,transparent 100%)",
              boxShadow: "0 0 40px rgba(251,191,36,0.8)",
            }}
          />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={{ y: [0, 18, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full bg-white/75"
              style={{ top: `${10 + i * 14}%`, left: `${12 + i * 28}%`, width: 48 + i * 20, height: 14 + i * 3 }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-16"
            style={{ background: "linear-gradient(180deg, transparent, rgba(20,83,45,0.85))" }} />
        </div>

        {/* Vertical stone path — scrolls downward */}
        <div className="absolute inset-x-[14%] bottom-0 top-[38%] overflow-hidden rounded-t-[40%] stone-path">
          <VerticalScroller paused={pausedRef.current} />
          {/* lane dividers — vertical gold rails */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: `${33.33 * (i + 1)}%`,
                width: 0,
                borderLeft: "3px dashed rgba(250,204,21,0.75)",
              }}
            />
          ))}
          {/* depth vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 85%, transparent 25%, rgba(0,0,0,0.55) 100%)" }}
          />
        </div>

        {/* Side jungle props */}
        <div className="pointer-events-none absolute inset-y-[38%] left-0 w-[14%]"
          style={{ background: "linear-gradient(90deg, rgba(21,128,61,0.95), transparent)" }} />
        <div className="pointer-events-none absolute inset-y-[38%] right-0 w-[14%]"
          style={{ background: "linear-gradient(-90deg, rgba(21,128,61,0.95), transparent)" }} />

        {/* Lane tap zones — left / center / right */}
        <div className="absolute inset-x-[14%] bottom-0 top-[38%] flex">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => !pausedRef.current && setLane(i as 0 | 1 | 2)}
              className="relative flex-1 outline-none"
              aria-label={`Lane ${i === 0 ? "left" : i === 1 ? "center" : "right"}`}
            >
              {lane === i && (
                <motion.div
                  layoutId="lane-glow-v"
                  className="absolute inset-x-1 inset-y-2 rounded-2xl"
                  style={{
                    background: "linear-gradient(180deg, rgba(34,197,94,0) 0%, rgba(34,197,94,0.35) 50%, rgba(34,197,94,0) 100%)",
                    border: "2px dashed rgba(250,204,21,0.9)",
                    boxShadow: "inset 0 0 24px rgba(34,197,94,0.25)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Speed streaks when running */}
        {phase === "running" && !challenge && (
          <div className="pointer-events-none absolute inset-x-[22%] inset-y-[40%] overflow-hidden opacity-30">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ y: "-20%" }}
                animate={{ y: "120%" }}
                transition={{ duration: 0.55 + i * 0.08, repeat: Infinity, ease: "linear", delay: i * 0.12 }}
                className="absolute h-8 w-0.5 rounded-full bg-white/80"
                style={{ left: `${15 + i * 18}%` }}
              />
            ))}
          </div>
        )}

        {/* Hint banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={hint}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute left-1/2 top-3 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border-2 px-3 py-1 text-[10px]"
            style={{ background: "rgba(255,255,255,0.95)", borderColor: "#1E293B", color: "#1E293B", boxShadow: "0 3px 0 #1E293B" }}
          >
            <span className="font-display uppercase tracking-[0.16em]">{hint}</span>
          </motion.div>
        </AnimatePresence>

        {/* Pickups + flash */}
        <div className="pointer-events-none absolute inset-0">
          {pickups.map((p) => (
            <PickupSprite key={p.id} pickup={p} />
          ))}
          {flash && (
            <CollectFlash key={flash.id} lane={flash.lane} career={flash.career} correct={flash.correct} />
          )}
        </div>

        {activePortal && <PortalSprite portal={activePortal} />}
        <Explorer lane={lane} />

        {/* Lane controls — swipe left/right */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          <LaneButton dir="left" onClick={() => setLane((l) => (l > 0 ? ((l - 1) as 0 | 1 | 2) : l))} />
          <div
            className="font-display rounded-full border-2 px-2.5 py-1 text-[9px] uppercase tracking-widest"
            style={{ borderColor: "#1E293B", background: "#FEF3C7", color: "#1E293B" }}
          >
            ← → swipe
          </div>
          <LaneButton dir="right" onClick={() => setLane((l) => (l < 2 ? ((l + 1) as 0 | 1 | 2) : l))} />
        </div>

        <AnimatePresence>{phase === "intro" && <IntroOverlay name={explorerName} />}</AnimatePresence>
        <AnimatePresence>
          {challenge && (
            <ChallengeOverlay
              career={challenge.career}
              portalQuestion={challenge.data}
              loading={challenge.loading}
              error={challenge.error}
              onAnswer={answerChallenge}
              onDismiss={() => setChallenge(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <CategoryScoreboard scores={scores} cleared={cleared} />
        </>
      )}

      {/* Post-run screens — full viewport landscape layout (outside vertical track) */}
      <AnimatePresence>
        {phase === "debrief" && (
          <RunDebrief
            scores={scores}
            name={explorerName}
            grade={grade}
            correct={correctAnswersCount}
            required={REQUIRED_CORRECT}
            portalAnswers={portalAnswers}
            onContinue={() => setPhase("hub")}
            onRetry={retryRun}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === "hub" && <IslandHub scores={scores} name={explorerName} onChoose={chooseIsland} />}
      </AnimatePresence>
    </motion.section>
  );
}

/* ---------------- HUD ---------------- */
function ArcadeHUD({ name, distance, totalScore, cleared, progress, correctAnswers, required }: {
  name: string; distance: number; totalScore: number; cleared: Career[]; progress: number;
  correctAnswers: number; required: number;
}) {
  return (
    <div
      className="relative z-10 w-full max-w-[420px] rounded-2xl border-[3px] px-4 py-3"
      style={{
        borderColor: "#FBBF24",
        background: "linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)",
        boxShadow: "0 8px 0 #1E293B, 0 16px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-display text-[9px] uppercase tracking-[0.28em]" style={{ color: "#B45309" }}>
            🏃 Explorer
          </div>
          <div className="font-display text-base leading-tight" style={{ color: "#1E293B" }}>{name}</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <HudStat label="Run" value={`${distance}m`} color="#0EA5E9" />
          <HudStat label="XP" value={String(totalScore)} color="#F59E0B" big />
          <HudStat label="⭐" value={`${correctAnswers}/${required}`} color="#22C55E" big />
        </div>
      </div>
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[9px]" style={{ color: "#64748B" }}>
          <span className="font-display uppercase tracking-widest">🧭 {required} strong instincts → Compass</span>
          <span className="font-mono">{Math.floor(progress * 100)}%</span>
        </div>
        <div
          className="relative mt-1 h-2.5 overflow-hidden rounded-full"
          style={{ background: "#E2E8F0", boxShadow: "inset 0 2px 3px rgba(30,41,59,0.15)" }}
        >
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#FBBF24,#F97316,#38BDF8,#22C55E,#EC4899)" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-medium">
          {CAREER_ORDER.map((c) => {
            const meta = CAREER_META[c];
            const done = cleared.includes(c);
            return (
              <span
                key={c}
                className="flex items-center gap-0.5 transition-transform"
                style={{
                  color: done ? meta.color : "#94A3B8",
                  opacity: done ? 1 : 0.65,
                  transform: done ? "scale(1.08)" : "scale(1)",
                }}
                title={meta.label}
              >
                <span>{meta.emoji}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HudStat({ label, value, color, big }: { label: string; value: string; color: string; big?: boolean }) {
  return (
    <div className="text-right">
      <div className="font-display text-[9px] uppercase tracking-[0.22em]" style={{ color: "#64748B" }}>{label}</div>
      <div className="font-display leading-none"
        style={{ color, fontSize: big ? "1.5rem" : "1.05rem", textShadow: big ? "0 2px 0 rgba(30,41,59,0.25)" : "none" }}>
        {value}
      </div>
    </div>
  );
}

function VerticalScroller({ paused }: { paused: boolean }) {
  return (
    <motion.div
      animate={paused ? { y: 0 } : { y: ["0%", "24%"] }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(255,255,255,0.14) 0 3px, transparent 3px 72px)," +
          "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 40px, transparent 40px 80px)",
        backgroundSize: "100% 200%",
      }}
    />
  );
}

/* ---------------- Sprites (vertical Temple Run layout) ---------------- */
const LANE_X = ["22%", "50%", "78%"] as const;
const PLAYER_Y = "86%";

function PickupSprite({ pickup }: { pickup: Pickup }) {
  const meta = CAREER_META[pickup.career];
  const Icon = meta.Icon;
  const topPct = Math.max(-5, Math.min(95, pickup.y));
  const scale = 0.45 + Math.min(1, Math.max(0, pickup.y) / 85) * 0.85;
  return (
    <motion.div
      animate={{ rotate: [0, 10, -10, 0], y: [0, -3, 0] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="absolute z-[2] flex items-center justify-center"
      style={{
        left: LANE_X[pickup.lane],
        top: `${topPct}%`,
        transform: `translate(-50%,-50%) scale(${scale})`,
      }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, #fff 0%, ${meta.color} 75%)`,
          boxShadow: `0 0 16px ${meta.ring}, 0 5px 0 rgba(30,41,59,0.45)`,
          border: "2px solid #1E293B",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "#1E293B" }} strokeWidth={2.4} />
      </div>
    </motion.div>
  );
}

function CollectFlash({ lane, career, correct }: { lane: 0 | 1 | 2; career: Career; correct?: boolean }) {
  const meta = CAREER_META[career];
  const label = correct === true ? "+20 ⭐" : correct === false ? "Hmm…" : "✨";
  const bg = correct === false ? "#FCA5A5" : meta.color;
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.6, y: 0 }}
      animate={{ opacity: 0, scale: 1.5, y: -36 }}
      transition={{ duration: 0.55 }}
      className="absolute z-20"
      style={{ left: LANE_X[lane], top: PLAYER_Y, transform: "translate(-50%,-50%)" }}
    >
      <div
        className="font-display rounded-full px-3 py-1 text-sm"
        style={{ background: bg, color: "#1E293B", border: "2px solid #1E293B", boxShadow: "0 4px 0 #1E293B" }}
      >
        {label}
      </div>
    </motion.div>
  );
}

function PortalSprite({ portal }: { portal: Portal }) {
  const meta = CAREER_META[portal.career];
  const Icon = meta.Icon;
  const topPct = Math.max(-5, Math.min(95, portal.y));
  const scale = 0.5 + Math.min(1, Math.max(0, portal.y) / 85) * 1.05;
  return (
    <motion.div
      className="absolute z-[3]"
      style={{
        left: LANE_X[portal.lane],
        top: `${topPct}%`,
        transform: `translate(-50%,-50%) scale(${scale})`,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${meta.color}, #fff, ${meta.color})`,
          boxShadow: meta.glow,
          border: "3px solid #1E293B",
        }}
      >
        <div
          className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 35%, #fff 0%, ${meta.color} 80%)`,
            border: "3px solid #1E293B",
          }}
        >
          <Icon className="h-8 w-8" style={{ color: "#1E293B" }} strokeWidth={2.4} />
        </div>
      </motion.div>
      <div
        className="font-display absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border-2 px-2 py-0.5 text-[9px] uppercase tracking-widest"
        style={{ background: "#fff", borderColor: "#1E293B", color: "#1E293B" }}
      >
        {meta.emoji} {meta.short}
      </div>
    </motion.div>
  );
}

function Explorer({ lane }: { lane: 0 | 1 | 2 }) {
  return (
    <motion.div
      animate={{ left: LANE_X[lane] }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="absolute z-[5]"
      style={{ left: LANE_X[lane], top: PLAYER_Y, transform: "translate(-50%,-50%)" }}
    >
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 0.35, repeat: Infinity }}
        className="relative flex h-[4.5rem] w-14 flex-col items-center"
      >
        <div
          className="absolute -bottom-1 h-2 w-14 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)", filter: "blur(4px)" }}
        />
        <div
          className="h-8 w-8 rounded-full"
          style={{
            background: "linear-gradient(180deg,#FCD34D 0%,#F59E0B 100%)",
            border: "2.5px solid #1E293B",
            boxShadow: "inset -2px -3px 0 rgba(30,41,59,0.25)",
          }}
        />
        <div
          className="-mt-1 h-10 w-12 rounded-t-2xl rounded-b-xl"
          style={{
            background: "linear-gradient(180deg,#22C55E 0%,#15803D 100%)",
            border: "2.5px solid #1E293B",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -right-1 top-2 h-2 w-2 rounded-full bg-[#FBBF24]"
          style={{ boxShadow: "0 0 8px #FBBF24" }}
        />
      </motion.div>
    </motion.div>
  );
}

function LaneButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full active:translate-y-0.5"
      style={{
        background: "#FFFFFF",
        border: "2.5px solid #1E293B",
        boxShadow: "0 4px 0 #1E293B",
        color: "#1E293B",
      }}
      aria-label={dir === "left" ? "Move left" : "Move right"}
    >
      <Icon className="h-6 w-6" strokeWidth={3} />
    </button>
  );
}

function IntroOverlay({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="rounded-2xl border-4 px-5 py-5 text-center"
        style={{ background: "#FFFFFF", borderColor: "#FBBF24", boxShadow: "0 12px 0 #1E293B" }}
      >
        <div className="font-display text-[10px] uppercase tracking-[0.32em]" style={{ color: "#B45309" }}>
          🌴 Vertical Discovery Run
        </div>
        <div className="font-display mt-1 text-2xl" style={{ color: "#1E293B" }}>
          Run, {name}!
        </div>
        <div className="mt-2 text-sm leading-snug" style={{ color: "#64748B" }}>
          Swipe <strong>← →</strong> to dodge lanes. Hit glowing portals, answer challenges, and collect{" "}
          <strong>{REQUIRED_CORRECT}</strong> strong instincts to unlock the Compass!
        </div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="mt-3 text-2xl"
        >
          ⬇️
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ChallengeOverlay({ career, portalQuestion, loading, error, onAnswer, onDismiss }: {
  career: Career;
  portalQuestion: PortalQuestionResponse | null;
  loading: boolean;
  error?: boolean;
  onAnswer: (option: PortalQuestionOption) => void;
  onDismiss: () => void;
}) {
  const meta = CAREER_META[career]; const Icon = meta.Icon;
  const levelLabel = portalQuestion ? `Level ${portalQuestion.level} · ${portalQuestion.theme}` : "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center p-4"
      style={{ background: "rgba(30,41,59,0.6)", backdropFilter: "blur(5px)" }}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="w-full max-w-md rounded-2xl border-4 p-5"
        style={{ background: "#FFFFFF", borderColor: "#1E293B", boxShadow: `0 18px 0 #1E293B, ${meta.glow}` }}>
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: meta.color, border: "2px solid #1E293B" }}>
            <Icon className="h-6 w-6" style={{ color: "#1E293B" }} strokeWidth={2.6} />
          </div>
          <div>
            <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
              {meta.emoji} {meta.label}
            </div>
            <div className="font-display text-lg" style={{ color: "#1E293B" }}>Portal Challenge</div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-10" style={{ color: "#64748B" }}>
            <RefreshCw className="h-7 w-7 animate-spin" />
            <span className="font-display text-[10px] uppercase tracking-[0.28em]">Loading grade-level question…</span>
          </div>
        )}

        {error && !loading && (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: "#64748B" }}>Couldn&apos;t load a question. Is the backend running?</p>
            <button onClick={onDismiss} className="font-display mt-4 rounded-xl px-4 py-2 text-sm uppercase tracking-wider"
              style={{ border: "2px solid #1E293B", background: "#F8FAFC" }}>Continue run</button>
          </div>
        )}

        {portalQuestion && !loading && !error && (
          <>
            <div className="font-display mt-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: meta.color }}>
              {levelLabel}
            </div>
            <p className="mt-2 text-sm leading-snug" style={{ color: "#1E293B" }}>{portalQuestion.question.text}</p>
            <div className="mt-4 flex flex-col gap-2">
              {portalQuestion.question.options.map((o) => (
                <button key={o.label} onClick={() => onAnswer(o)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-transform active:translate-y-0.5"
                  style={{ background: "#F8FAFC", border: "2px solid #1E293B", color: "#1E293B", boxShadow: "0 3px 0 #1E293B" }}>
                  <span className="font-display flex h-7 w-7 flex-none items-center justify-center rounded-lg text-xs"
                    style={{ background: meta.color, border: "2px solid #1E293B" }}>{o.label}</span>
                  {o.text}
                </button>
              ))}
            </div>
            <div className="font-display mt-3 text-center text-[10px] uppercase tracking-widest" style={{ color: "#94A3B8" }}>
              Strong career instincts unlock the Compass.
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Run Debrief — live mentor video + AI text feedback ----------------
   Uses POST /run/debrief with the student's real portal answers and scores.
   The backend picks the right mentor character and Tavus prompt. */

function RunDebrief({
  scores, name, grade, correct, required, portalAnswers, onContinue, onRetry,
}: {
  scores: CareerScores;
  name: string;
  grade: number;
  correct: number;
  required: number;
  portalAnswers: PortalAnswerRecord[];
  onContinue: () => void;
  onRetry: () => void;
}) {
  const [debrief, setDebrief] = useState<RunDebriefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const debriefConvRef = useRef<string | null>(null);

  const endDebriefVideo = useCallback(async () => {
    const id = debriefConvRef.current;
    if (!id) return;
    debriefConvRef.current = null;
    await api.endConversation(id).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .runDebrief({
        studentName: name,
        grade,
        scores,
        correctCount: correct,
        requiredCount: required,
        portalAnswers,
      })
      .then((res) => {
        if (cancelled) return;
        setDebrief(res);
        if (hasVideo(res.video)) debriefConvRef.current = res.video.conversationId;
        if (res.video && "error" in res.video) setVideoError(res.video.error);
      })
      .catch((err: Error) => {
        if (!cancelled) setVideoError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [name, grade, scores, correct, required, portalAnswers]);

  useEffect(() => {
    return () => {
      void endDebriefVideo();
    };
  }, [endDebriefVideo]);

  const recommended = (debrief?.recommended ??
    (Object.keys(scores) as Career[]).reduce((a, b) => (scores[a] >= scores[b] ? a : b))) as Career;
  const passed = correct >= required;
  const meta = CAREER_META[recommended];
  const mentorName = debrief?.mentorName ?? `${meta.short} mentor`;
  const videoUrl = debrief && hasVideo(debrief.video) ? debrief.video.conversationUrl : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6 sm:px-8 sm:py-10"
      style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)" }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="mx-auto w-full max-w-6xl rounded-3xl border-4 p-5 sm:p-8"
        style={{ background: "#FFFFFF", borderColor: "#1E293B", boxShadow: "0 18px 0 #1E293B" }}
      >

        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6" style={{ color: meta.color }} />
          <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
            🧭 Mentor Debrief · {correct}/{required} strong instincts
          </div>
        </div>
        <div className="font-display mt-1 text-2xl sm:text-3xl" style={{ color: "#1E293B" }}>
          {passed
            ? <>Discovery Run Complete, {name}!</>
            : <>Great effort, {name} — let's review</>}
        </div>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
          Your mentor will tell you how you did and ask what you'd like to learn more about — listen or read below.
        </p>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center" style={{ color: "#64748B" }}>
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="font-display text-[11px] uppercase tracking-[0.3em]">
              {mentorName} is preparing your debrief…
            </span>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div
                className="relative overflow-hidden rounded-2xl border-4"
                style={{
                  borderColor: "#1E293B",
                  boxShadow: "0 8px 0 #1E293B",
                  aspectRatio: "16 / 9",
                  minHeight: "240px",
                }}
              >
                {videoUrl ? (
                  <MentorVideo
                    key={videoUrl}
                    conversationUrl={videoUrl}
                    studentName={name}
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-2 px-4 text-center"
                    style={{ background: meta.color + "22", color: "#1E293B" }}>
                    <div className="text-5xl">{meta.emoji}</div>
                    <div className="font-display text-sm">{mentorName}</div>
                    <div className="text-xs" style={{ color: "#64748B" }}>
                      {videoError ? `Video: ${videoError}` : "Live video unavailable — read the coaching below."}
                    </div>
                  </div>
                )}
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                  </span>
                  <span className="font-display text-[9px] uppercase tracking-[0.22em] text-white">
                    Live · {mentorName}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border-2 p-3" style={{ borderColor: "#1E293B", background: "#F0FDF4" }}>
                <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#16A34A" }}>
                  {mentorName}'s coaching
                </div>
                <p className="mt-1 text-sm leading-snug" style={{ color: "#1E293B", fontFamily: "var(--font-serif-quest)" }}>
                  {debrief?.feedback ??
                    "Every run teaches you something about how you think. Let's run it again and keep exploring!"}
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="rounded-xl border-2 p-3" style={{ borderColor: "#1E293B", background: "#FEF3C7" }}>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" style={{ color: "#B45309" }} />
                  <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#B45309" }}>
                    Your Career Compass
                  </div>
                </div>
                <p className="mt-1 text-sm leading-snug" style={{ color: "#1E293B" }}>
                  {debrief?.message ??
                    `You showed the strongest spark in the ${meta.short} world. Keep exploring where you shine!`}
                </p>
              </div>

              <div className="mt-3 space-y-1.5">
                {(debrief?.ranking ??
                  (Object.entries(scores) as [Career, number][])
                    .map(([world, score]) => ({ world, score }))
                    .sort((a, b) => b.score - a.score)
                ).map((r) => {
                  const m = CAREER_META[r.world as Career];
                  const max = Math.max(1, ...Object.values(scores), ...(debrief?.ranking ?? []).map((x) => x.score));
                  return (
                    <div key={r.world} className="flex items-center gap-2">
                      <span className="w-24 flex-none text-[11px] font-medium" style={{ color: "#1E293B" }}>
                        {m.emoji} {m.short}
                      </span>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "#E2E8F0" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(r.score / max) * 100}%` }}
                          transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: m.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {debrief?.recommendedCareers?.length ? (
                <div className="mt-3">
                  <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#64748B" }}>
                    Careers to explore next
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {debrief.recommendedCareers.slice(0, 5).map((c) => (
                      <span key={c} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                        style={{ background: meta.color, color: "#1E293B", border: "2px solid #1E293B" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => void endDebriefVideo().then(onRetry)}
            className="font-display inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 uppercase tracking-wider"
            style={{ background: "#F8FAFC", color: "#1E293B", border: "3px solid #1E293B", boxShadow: "0 5px 0 #1E293B" }}>
            <RefreshCw className="h-5 w-5" /> Run Again
          </button>
          {passed ? (
            <button
              onClick={() => void endDebriefVideo().then(onContinue)}
              className="font-display inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 uppercase tracking-wider"
              style={{ background: "linear-gradient(180deg,#22C55E 0%,#16A34A 100%)", color: "#fff", border: "3px solid #1E293B", boxShadow: "0 5px 0 #1E293B" }}>
              <Award className="h-5 w-5" /> Choose Your Island
            </button>
          ) : (
            <div className="flex items-center justify-center rounded-2xl px-4 py-3 text-center text-xs"
              style={{ background: "#FEF2F2", border: "3px solid #1E293B", color: "#7F1D1D" }}>
              Hit {required} strong instincts to unlock your islands.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Island Selection Hub ---------------- */
function IslandHub({ scores, name, onChoose }: { scores: CareerScores; name: string; onChoose: (c: Career) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto px-4 py-5 sky-island-bg"
    >
      <div className="text-center">
        <div className="font-display text-[10px] uppercase tracking-[0.32em]" style={{ color: "#0F172A" }}>
          Selection Hub · {name}
        </div>
        <div className="font-display mt-1 text-3xl leading-tight sm:text-4xl" style={{ color: "#0F172A", textShadow: "0 3px 0 rgba(255,255,255,0.45)" }}>
          🧭 Pick an Island
        </div>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-snug" style={{ color: "#0F172A" }}>
          The Compass is yours. Choose an <span className="font-bold">ISLAND</span> to begin the deep-learning adventure.
        </p>
      </div>

      <div className="mt-5 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAREER_ORDER.map((c, i) => {
          const meta = CAREER_META[c];
          const Icon = meta.Icon;
          const img = ISLAND_IMG[c];
          return (
            <motion.button key={c}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: [0, -8, 0], opacity: 1 }}
              transition={{ y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.4, delay: i * 0.08 } }}
              onClick={() => onChoose(c)}
              className="group relative overflow-hidden rounded-3xl border-4 text-left transition-transform active:translate-y-1"
              style={{ background: "#FFFFFF", borderColor: "#1E293B", boxShadow: `0 12px 0 #1E293B, ${meta.glow}` }}>
              <div className="relative h-44 w-full overflow-hidden" style={{ background: ISLAND_FALLBACK_BG[c] }}>
                {img ? (
                  <img src={img} alt={meta.island} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-6xl drop-shadow-lg">{meta.emoji}</div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-12" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.4))" }} />
              </div>
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: meta.color, border: "2px solid #1E293B" }}>
                  <Icon className="h-6 w-6" style={{ color: "#1E293B" }} strokeWidth={2.6} />
                </div>
                <div className="flex-1">
                  <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#64748B" }}>
                    {meta.emoji} {meta.short}
                  </div>
                  <div className="font-display text-lg leading-tight" style={{ color: "#1E293B" }}>{meta.island}</div>
                </div>
                <div className="font-display text-xl" style={{ color: meta.color, textShadow: "0 2px 0 rgba(30,41,59,0.25)" }}>
                  {scores[c]}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 max-w-md text-center text-[12px]" style={{ color: "#0F172A" }}>
        Tap any island to lock it in and unlock your deep-learning adventure.
      </div>
    </motion.div>
  );
}

function CategoryScoreboard({ scores, cleared }: { scores: CareerScores; cleared: Career[] }) {
  return (
    <div className="mt-3 grid w-full max-w-[420px] grid-cols-5 gap-1.5">
      {CAREER_ORDER.map((c) => {
        const meta = CAREER_META[c]; const Icon = meta.Icon; const done = cleared.includes(c);
        return (
          <div key={c} className="rounded-xl border-2 px-2 py-2 text-center"
            style={{ borderColor: "#1E293B", background: done ? "#FFFFFF" : "#F1F5F9",
              boxShadow: "0 3px 0 #1E293B", opacity: done ? 1 : 0.85 }}>
            <Icon className="mx-auto h-4 w-4" style={{ color: meta.color }} />
            <div className="font-display mt-0.5 text-lg leading-none" style={{ color: "#1E293B" }}>{scores[c]}</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: "#64748B" }}>{meta.short}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   BUSINESS KINGDOM — Phase 2: Level 1 Entrepreneurship
   ============================================================ */

type Metrics = { customers: number; revenue: number; profit: number };

type Decision = {
  prompt: string;
  options: { label: string; delta: Partial<Metrics> }[];
};

type Stage = {
  id: string;
  title: string;
  emoji: string;
  intro: string;
  decisions: Decision[];
  outro?: string;
};

const BUSINESS_STAGES: Stage[] = [
  {
    id: "lemonade", title: "Lemonade Stand", emoji: "🍋",
    intro: "Your first venture! Mix sugar, lemons, and a little courage.",
    decisions: [
      { prompt: "Who is your target customer?", options: [
        { label: "Tired joggers in the park", delta: { customers: 40, revenue: 60, profit: 40 } },
        { label: "Bored kids on your street", delta: { customers: 25, revenue: 25, profit: 18 } },
        { label: "Office workers downtown", delta: { customers: 15, revenue: 70, profit: 55 } },
      ] },
      { prompt: "Price per cup?", options: [
        { label: "$1 — irresistible", delta: { customers: 60, revenue: 60, profit: 20 } },
        { label: "$2 — fair", delta: { customers: 40, revenue: 80, profit: 50 } },
        { label: "$5 — premium artisanal", delta: { customers: 10, revenue: 50, profit: 45 } },
      ] },
      { prompt: "Inventory order?", options: [
        { label: "Buy small, sell out quick", delta: { customers: 20, revenue: 30, profit: 25 } },
        { label: "Buy big, risk waste", delta: { customers: 35, revenue: 55, profit: 15 } },
      ] },
      { prompt: "Marketing sign budget?", options: [
        { label: "Hand-drawn cardboard", delta: { customers: 15, revenue: 15, profit: 12 } },
        { label: "Glow-in-the-dark banner", delta: { customers: 55, revenue: 60, profit: 30 } },
      ] },
    ],
    outro: "You increased profits by raising prices, but you also lost customers. Great entrepreneurs balance growth with customer satisfaction.",
  },
  {
    id: "foodtruck", title: "Food Truck", emoji: "🚚",
    intro: "Wheels under your dream. Time to scale.",
    decisions: [
      { prompt: "Hire your first employee?", options: [
        { label: "Yes — a friend who hustles", delta: { customers: 50, revenue: 70, profit: 30 } },
        { label: "No — keep it solo", delta: { customers: 10, revenue: 30, profit: 28 } },
      ] },
      { prompt: "Pick a prime street spot?", options: [
        { label: "Downtown lunch corner ($$$)", delta: { customers: 80, revenue: 120, profit: 50 } },
        { label: "Quiet neighborhood (cheap)", delta: { customers: 25, revenue: 35, profit: 30 } },
      ] },
      { prompt: "Expand the menu?", options: [
        { label: "Add 3 trendy items", delta: { customers: 40, revenue: 60, profit: 25 } },
        { label: "Master one signature dish", delta: { customers: 30, revenue: 50, profit: 45 } },
      ] },
      { prompt: "Employee hourly wage?", options: [
        { label: "$10/hr — minimum", delta: { customers: 0, revenue: 0, profit: 30 } },
        { label: "$18/hr — they stay loyal", delta: { customers: 25, revenue: 30, profit: 12 } },
      ] },
    ],
  },
  {
    id: "coffee", title: "Coffee Shop", emoji: "☕",
    intro: "A real storefront. A real rival opens across the street.",
    decisions: [
      { prompt: "Your competitive defense strategy?", options: [
        { label: "Lower prices — undercut them", delta: { customers: 60, revenue: 30, profit: -10 } },
        { label: "Better quality beans", delta: { customers: 40, revenue: 70, profit: 45 } },
        { label: "Faster service — 90s guarantee", delta: { customers: 55, revenue: 60, profit: 35 } },
        { label: "Stronger branding & vibe", delta: { customers: 35, revenue: 80, profit: 50 } },
      ] },
    ],
  },
  {
    id: "startup", title: "Startup", emoji: "🚀",
    intro: "Now you're building something the world needs.",
    decisions: [
      { prompt: "Core customer problem?", options: [
        { label: "People waste time finding parking", delta: { customers: 70, revenue: 80, profit: 40 } },
        { label: "Students struggle to focus", delta: { customers: 60, revenue: 60, profit: 35 } },
        { label: "Pet owners forget vet visits", delta: { customers: 30, revenue: 30, profit: 20 } },
      ] },
      { prompt: "Production costing model?", options: [
        { label: "Subscription ($/month)", delta: { customers: 50, revenue: 90, profit: 55 } },
        { label: "One-time purchase", delta: { customers: 60, revenue: 60, profit: 30 } },
        { label: "Freemium + ads", delta: { customers: 80, revenue: 40, profit: 20 } },
      ] },
      { prompt: "Marketing execution?", options: [
        { label: "TikTok creator partnerships", delta: { customers: 90, revenue: 70, profit: 30 } },
        { label: "SEO and content blog", delta: { customers: 40, revenue: 60, profit: 50 } },
        { label: "Cold email + outbound", delta: { customers: 25, revenue: 75, profit: 60 } },
      ] },
    ],
  },
];

const SHARK_QUESTIONS = [
  {
    q: "Why should someone buy your product instead of a competitor's?",
    options: [
      { label: "We solve the problem 10× faster than anyone else.", boost: 50 },
      { label: "Because our logo is cooler.", boost: 10 },
      { label: "We're cheapest — race to the bottom.", boost: 20 },
    ],
  },
  {
    q: "How will you make money?",
    options: [
      { label: "Recurring subscription with clear LTV/CAC.", boost: 55 },
      { label: "We'll figure it out after we get users.", boost: 5 },
      { label: "Sell user data.", boost: 0 },
    ],
  },
  {
    q: "What's your moat?",
    options: [
      { label: "Proprietary data + network effects.", boost: 50 },
      { label: "We move fast.", boost: 15 },
      { label: "We work hard.", boost: 10 },
    ],
  },
];

function BusinessKingdom() {
  const { explorerName, grade, setCurrentStep } = useAppState();
  const [stageIdx, setStageIdx] = useState(-1); // -1 = intro splash, 0 = Lemonade Stand (backend)
  const [decisionIdx, setDecisionIdx] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({ customers: 0, revenue: 0, profit: 0 });
  const [showMentor, setShowMentor] = useState(true);
  const [mentorText, setMentorText] = useState(
    "Hey there — I'm Sam Park, your business mentor. Level 1 is Entrepreneurship: build your own venture from scratch and grow from a neighborhood stand toward a million-dollar company. Let's run your very first Lemonade Stand!"
  );
  const [showOutro, setShowOutro] = useState<string | null>(null);
  // shark tank state
  const [sharkIdx, setSharkIdx] = useState(0);
  const [sharkScore, setSharkScore] = useState(0);
  const [victory, setVictory] = useState(false);

  // === Backend-driven Lemonade Stand (Challenge 1) ===
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeError, setChallengeError] = useState(false);
  const [lemonadeAnswers, setLemonadeAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showMentorMoment, setShowMentorMoment] = useState(false);

  // Load the real Lemonade Stand challenge from the backend on mount.
  useEffect(() => {
    let cancelled = false;
    api
      .getChallenge("business")
      .then((c) => !cancelled && setChallenge(c))
      .catch(() => !cancelled && setChallengeError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const inShark = stageIdx === BUSINESS_STAGES.length; // shark tank
  const inLemonade = stageIdx === 0; // backend-driven challenge
  // Local bonus stages (Food Truck onward); the Lemonade Stand (index 0) is
  // handled separately via the backend simulation.
  const currentStage = stageIdx >= 1 && stageIdx < BUSINESS_STAGES.length ? BUSINESS_STAGES[stageIdx] : null;
  const currentDecision = currentStage?.decisions[decisionIdx];
  const lemonadeDecision = challenge?.decisions[decisionIdx];

  const startStage = (i: number) => {
    setStageIdx(i); setDecisionIdx(0); setShowOutro(null);
    if (i >= 1 && i < BUSINESS_STAGES.length) {
      setMentorText(`Stage ${i + 1}: ${BUSINESS_STAGES[i]!.title}. ${BUSINESS_STAGES[i]!.intro}`);
      setShowMentor(true);
    }
  };

  // Record one Lemonade Stand answer (A/B/C/D). After the final decision,
  // submit everything to the backend for the real simulation + Sam Park video.
  const pickLemonade = (decisionId: string, label: string) => {
    if (!challenge) return;
    const answers = { ...lemonadeAnswers, [decisionId]: label };
    setLemonadeAnswers(answers);
    const nextD = decisionIdx + 1;
    if (nextD >= challenge.decisions.length) {
      void submitLemonade(answers);
    } else {
      setDecisionIdx(nextD);
    }
  };

  const submitLemonade = async (answers: Record<string, string>) => {
    setSubmitting(true);
    try {
      const res = await api.submitFeedback("business", {
        studentName: explorerName,
        grade,
        answers,
      });
      setFeedback(res);
      setMentorText(res.feedback);
      if (res.simulation) {
        setMetrics({
          customers: res.simulation.sales,
          revenue: res.simulation.revenue,
          profit: res.simulation.profit,
        });
      }
      setShowMentorMoment(true);
    } catch {
      // Even if the backend hiccups, let the student continue with the bonus
      // stages rather than dead-ending the kingdom.
      setMentorText(
        "I couldn't reach the simulation just now, but great hustle on your first stand! Let's keep building.",
      );
      setShowMentorMoment(true);
    } finally {
      setSubmitting(false);
    }
  };

  const pickOption = (delta: Partial<Metrics>) => {
    setMetrics((m) => ({
      customers: Math.max(0, m.customers + (delta.customers ?? 0)),
      revenue: Math.max(0, m.revenue + (delta.revenue ?? 0)),
      profit: Math.max(0, m.profit + (delta.profit ?? 0)),
    }));
    if (!currentStage) return;
    const nextD = decisionIdx + 1;
    if (nextD >= currentStage.decisions.length) {
      // stage complete
      if (currentStage.outro) setShowOutro(currentStage.outro);
      else advanceStage();
    } else {
      setDecisionIdx(nextD);
    }
  };

  // Leave the Sam Park mentor moment and roll into the local bonus stages.
  const continueFromMentorMoment = () => {
    setShowMentorMoment(false);
    advanceStage();
  };

  const advanceStage = () => {
    setShowOutro(null);
    if (stageIdx + 1 < BUSINESS_STAGES.length) {
      startStage(stageIdx + 1);
    } else {
      // enter shark tank
      setStageIdx(BUSINESS_STAGES.length);
      setSharkIdx(0); setSharkScore(0);
      setMentorText("Boss battle: pitch to the Sharks. Choose answers that show vision, traction, and defensibility.");
      setShowMentor(true);
    }
  };

  const pickShark = (boost: number) => {
    const next = sharkScore + boost;
    setSharkScore(next);
    setMetrics((m) => ({ ...m, profit: m.profit + boost, revenue: m.revenue + boost }));
    if (sharkIdx + 1 >= SHARK_QUESTIONS.length) {
      setVictory(true);
    } else {
      setSharkIdx(sharkIdx + 1);
    }
  };

  if (victory) return <VictoryScreen metrics={metrics} sharkScore={sharkScore} name={explorerName} onFinish={() => setCurrentStep("recommendation")} />;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg,#FEF3C7 0%,#FDE68A 40%,#FBBF24 100%)" }}>

      {/* parallax sun */}
      <div className="pointer-events-none absolute right-10 top-10 h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(circle,#FBBF24 0%,#F59E0B 70%,transparent 100%)", boxShadow: "0 0 80px rgba(251,191,36,0.7)" }} />

      {/* HUD */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-4 bg-white px-4 py-3"
          style={{ borderColor: "#1E293B", boxShadow: "0 8px 0 #1E293B" }}>
          <div>
            <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
              🏝 Sun-Coin Atoll · Phase 2
            </div>
            <div className="font-display text-xl" style={{ color: "#1E293B" }}>
              Level 1: Entrepreneurship
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MetricChip label="Customers" value={metrics.customers} color="#38BDF8" icon={<Users className="h-4 w-4" />} />
            <MetricChip label="Revenue" value={`$${metrics.revenue}`} color="#22C55E" icon={<DollarSign className="h-4 w-4" />} />
            <MetricChip label="Profit" value={`$${metrics.profit}`} color="#FBBF24" icon={<TrendingUp className="h-4 w-4" />} />
            <button onClick={() => setCurrentStep("gameplay")}
              className="font-display rounded-full border-2 px-3 py-1 text-[10px] uppercase tracking-widest"
              style={{ borderColor: "#1E293B", color: "#1E293B", background: "#F8FAFC", boxShadow: "0 3px 0 #1E293B" }}>
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Stage tracker */}
      <div className="relative z-10 mx-auto mt-4 max-w-6xl px-4">
        <div className="flex items-center justify-between gap-1 rounded-2xl border-4 bg-white/90 p-2"
          style={{ borderColor: "#1E293B", boxShadow: "0 6px 0 #1E293B" }}>
          {[...BUSINESS_STAGES, { id: "shark", title: "Shark Tank", emoji: "🦈" }].map((s, i) => {
            const done = stageIdx > i || (stageIdx === BUSINESS_STAGES.length && i < BUSINESS_STAGES.length);
            const active = stageIdx === i || (inShark && i === BUSINESS_STAGES.length);
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center">
                <div className="font-display flex h-10 w-full items-center justify-center rounded-xl border-2 text-lg"
                  style={{
                    background: active ? "#FBBF24" : done ? "#22C55E" : "#F1F5F9",
                    borderColor: "#1E293B", color: "#1E293B",
                    boxShadow: active ? "0 3px 0 #1E293B" : "none",
                  }}>
                  {s.emoji}
                </div>
                <div className="font-display mt-1 text-[9px] uppercase tracking-wider" style={{ color: "#1E293B" }}>
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-10 mx-auto mt-5 grid max-w-6xl gap-4 px-4 pb-24 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border-4 bg-white p-5"
          style={{ borderColor: "#1E293B", boxShadow: "0 10px 0 #1E293B" }}>
          {stageIdx === -1 && (
            <div className="py-6 text-center">
              <div className="text-6xl">🌅</div>
              <div className="font-display mt-3 text-3xl" style={{ color: "#1E293B" }}>Welcome, {explorerName}!</div>
              <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "#475569" }}>
                You're standing on Sun-Coin Atoll. From a single fruit stand to a billion-dollar pitch — let's begin.
              </p>
              <button onClick={() => startStage(0)} className="font-display mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 uppercase tracking-wider"
                style={{ background: "linear-gradient(180deg,#22C55E 0%,#16A34A 100%)", color: "#fff", border: "3px solid #1E293B", boxShadow: "0 6px 0 #1E293B" }}>
                <Rocket className="h-5 w-5" /> Begin Level 1
              </button>
            </div>
          )}

          {/* === Challenge 1 · Lemonade Stand — driven by GET /business/challenge === */}
          {inLemonade && !submitting && !showMentorMoment && (
            <div>
              {challenge && lemonadeDecision ? (
                <>
                  <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
                    Challenge 1 · Decision {decisionIdx + 1}/{challenge.decisions.length}
                  </div>
                  <div className="font-display flex items-center gap-2 text-2xl" style={{ color: "#1E293B" }}>
                    <span className="text-3xl">{challenge.emoji}</span> {challenge.title}
                  </div>
                  {decisionIdx === 0 && (
                    <p className="mt-2 text-sm" style={{ color: "#475569" }}>{challenge.scenario}</p>
                  )}
                  <p className="mt-3 text-base font-medium" style={{ color: "#1E293B" }}>{lemonadeDecision.prompt}</p>
                  <div className="mt-4 grid gap-2">
                    {lemonadeDecision.options.map((o) => (
                      <button key={o.label} onClick={() => pickLemonade(lemonadeDecision.id, o.label)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-transform active:translate-y-0.5"
                        style={{ background: "#F8FAFC", border: "2px solid #1E293B", color: "#1E293B", boxShadow: "0 3px 0 #1E293B" }}>
                        <span className="font-display flex h-7 w-7 flex-none items-center justify-center rounded-lg text-xs"
                          style={{ background: "#FBBF24", border: "2px solid #1E293B" }}>{o.label}</span>
                        {o.text}
                      </button>
                    ))}
                  </div>
                </>
              ) : challengeError ? (
                <div className="py-10 text-center">
                  <div className="text-4xl">📡</div>
                  <p className="mt-3 text-sm" style={{ color: "#475569" }}>
                    Couldn't reach the Lemonade Stand challenge. Is the backend running on{" "}
                    <code>{import.meta.env.VITE_API_BASE || "http://localhost:3001"}</code>?
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center" style={{ color: "#64748B" }}>
                  <RefreshCw className="h-7 w-7 animate-spin" />
                  <span className="font-display text-[11px] uppercase tracking-[0.3em]">Loading challenge…</span>
                </div>
              )}
            </div>
          )}

          {/* Sam Park is running the simulation */}
          {submitting && (
            <div className="flex flex-col items-center gap-3 py-16 text-center" style={{ color: "#64748B" }}>
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="font-display text-sm uppercase tracking-[0.25em]" style={{ color: "#1E293B" }}>
                Sam is reviewing your day…
              </span>
              <span className="text-xs">Simulating customers, demand &amp; profit.</span>
            </div>
          )}

          {/* === Sam Park Mentor Moment — live video + real simulation + text === */}
          {showMentorMoment && (
            <div>
              <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
                {feedback?.challengeTitle ?? "Lemonade Stand"} · Mentor Debrief
              </div>
              <div className="font-display flex items-center gap-2 text-2xl" style={{ color: "#1E293B" }}>
                <span className="text-3xl">🍋</span> {feedback?.mentorName ?? "Sam Park"} reviews your day
              </div>

              {feedback && hasVideo(feedback.video) && (
                <div className="relative mt-4 overflow-hidden rounded-2xl border-4"
                  style={{ borderColor: "#1E293B", boxShadow: "0 8px 0 #1E293B", aspectRatio: "16 / 9" }}>
                  <MentorVideo conversationUrl={feedback.video.conversationUrl} studentName={explorerName} />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                    </span>
                    <span className="font-display text-[9px] uppercase tracking-[0.22em] text-white">Live · {feedback.mentorName}</span>
                  </div>
                </div>
              )}

              {feedback?.simulation && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Cups Sold", value: `${feedback.simulation.sales}`, color: "#38BDF8" },
                    { label: "Revenue", value: `$${feedback.simulation.revenue.toFixed(0)}`, color: "#22C55E" },
                    { label: "Costs", value: `$${feedback.simulation.totalCost.toFixed(0)}`, color: "#F97316" },
                    { label: "Profit", value: `$${feedback.simulation.profit.toFixed(0)}`, color: "#FBBF24" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border-2 p-2 text-center"
                      style={{ borderColor: "#1E293B", background: "#FEF3C7", boxShadow: "0 3px 0 #1E293B" }}>
                      <div className="font-display text-[9px] uppercase tracking-widest" style={{ color: "#64748B" }}>{s.label}</div>
                      <div className="font-display text-lg" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-xl border-2 p-3" style={{ borderColor: "#1E293B", background: "#F0FDF4" }}>
                <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#16A34A" }}>
                  {feedback?.mentorName ?? "Sam Park"}'s coaching
                </div>
                <p className="mt-1 text-sm leading-snug" style={{ color: "#1E293B", fontFamily: "var(--font-serif-quest)" }}>
                  {feedback?.feedback ?? mentorText}
                </p>
              </div>

              <button onClick={continueFromMentorMoment} className="font-display mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 uppercase tracking-wider"
                style={{ background: "linear-gradient(180deg,#38BDF8 0%,#0EA5E9 100%)", color: "#fff", border: "3px solid #1E293B", boxShadow: "0 6px 0 #1E293B" }}>
                Keep Building <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {currentStage && !showOutro && currentDecision && (
            <div>
              <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
                Challenge {stageIdx + 1} · Decision {decisionIdx + 1}/{currentStage.decisions.length}
              </div>
              <div className="font-display flex items-center gap-2 text-2xl" style={{ color: "#1E293B" }}>
                <span className="text-3xl">{currentStage.emoji}</span> {currentStage.title}
              </div>
              <p className="mt-3 text-base font-medium" style={{ color: "#1E293B" }}>{currentDecision.prompt}</p>
              <div className="mt-4 grid gap-2">
                {currentDecision.options.map((o) => (
                  <button key={o.label} onClick={() => pickOption(o.delta)}
                    className="rounded-xl px-3 py-3 text-left text-sm font-medium transition-transform active:translate-y-0.5"
                    style={{ background: "#F8FAFC", border: "2px solid #1E293B", color: "#1E293B", boxShadow: "0 3px 0 #1E293B" }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showOutro && (
            <div className="py-4 text-center">
              <div className="text-4xl">🧠</div>
              <div className="font-display mt-2 text-xl" style={{ color: "#1E293B" }}>Lesson Learned</div>
              <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "#475569" }}>{showOutro}</p>
              <button onClick={advanceStage} className="font-display mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 uppercase tracking-wider"
                style={{ background: "linear-gradient(180deg,#38BDF8 0%,#0EA5E9 100%)", color: "#fff", border: "3px solid #1E293B", boxShadow: "0 6px 0 #1E293B" }}>
                Next Stage <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {inShark && (
            <div>
              <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
                Boss Battle · Question {sharkIdx + 1}/{SHARK_QUESTIONS.length}
              </div>
              <div className="font-display flex items-center gap-2 text-2xl" style={{ color: "#1E293B" }}>
                🦈 Shark Tank
              </div>
              <div className="mt-3 rounded-xl border-2 p-3" style={{ borderColor: "#1E293B", background: "#F1F5F9" }}>
                <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#64748B" }}>Investor asks</div>
                <p className="mt-1 text-base font-medium" style={{ color: "#1E293B" }}>{SHARK_QUESTIONS[sharkIdx]!.q}</p>
              </div>
              <div className="mt-4 grid gap-2">
                {SHARK_QUESTIONS[sharkIdx]!.options.map((o) => (
                  <button key={o.label} onClick={() => pickShark(o.boost)}
                    className="rounded-xl px-3 py-3 text-left text-sm font-medium transition-transform active:translate-y-0.5"
                    style={{ background: "#FFFFFF", border: "2px solid #1E293B", color: "#1E293B", boxShadow: "0 3px 0 #1E293B" }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mentor sidebar */}
        {showMentor && (
          <div className="rounded-3xl border-4 bg-white p-4"
            style={{ borderColor: "#1E293B", boxShadow: "0 10px 0 #1E293B" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2"
                  style={{ borderColor: "#1E293B", background: "linear-gradient(180deg,#FBBF24,#F59E0B)" }}>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-display">S</div>
                </div>
                <div>
                  <div className="font-display text-sm" style={{ color: "#1E293B" }}>
                    {feedback?.mentorName ?? "Sam Park"} · AI Mentor
                  </div>
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: "#22C55E" }}>
                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                      className="inline-block h-2 w-2 rounded-full" style={{ background: "#22C55E" }} />
                    live · connected
                  </div>
                </div>
              </div>
              <button onClick={() => setShowMentor(false)} aria-label="Close mentor"
                className="rounded-full border-2 p-1" style={{ borderColor: "#1E293B" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 rounded-xl border-2 p-3"
              style={{ borderColor: "#1E293B", background: "#FEF3C7" }}>
              <p className="text-sm leading-snug" style={{ color: "#1E293B", fontFamily: "var(--font-serif-quest)" }}>
                {mentorText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Summon Mentor button */}
      {!showMentor && (
        <button onClick={() => setShowMentor(true)}
          className="font-display fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "#38BDF8", border: "3px solid #1E293B", color: "#fff", boxShadow: "0 6px 0 #1E293B" }}
          aria-label="Summon Mentor">
          <HelpCircle className="h-7 w-7" />
        </button>
      )}
    </motion.section>
  );
}

function MetricChip({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ borderColor: "#1E293B", background: "#fff", boxShadow: "0 3px 0 #1E293B" }}>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: color, color: "#1E293B" }}>
        {icon}
      </div>
      <div>
        <div className="font-display text-[9px] uppercase tracking-widest" style={{ color: "#64748B" }}>{label}</div>
        <motion.div key={String(value)} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
          className="font-display text-lg leading-none" style={{ color: "#1E293B" }}>
          {value}
        </motion.div>
      </div>
    </div>
  );
}

/* ============================================================
   VICTORY SCREEN — Business Explorer Badge
   ============================================================ */
function VictoryScreen({ metrics, sharkScore, name, onFinish }: {
  metrics: Metrics; sharkScore: number; name: string; onFinish: () => void;
}) {
  const skills = [
    { label: "Strategic Thinking", value: Math.min(100, 60 + Math.floor(sharkScore / 3)), icon: <Target className="h-5 w-5" /> },
    { label: "Leadership", value: Math.min(100, 55 + Math.floor(metrics.customers / 10)), icon: <Users className="h-5 w-5" /> },
    { label: "Decision-Making", value: Math.min(100, 65 + Math.floor(metrics.profit / 15)), icon: <Lightbulb className="h-5 w-5" /> },
    { label: "Marketing Intuition", value: Math.min(100, 50 + Math.floor(metrics.revenue / 15)), icon: <MessageCircle className="h-5 w-5" /> },
  ];
  const paths = ["Entrepreneur", "Product Manager", "Marketing Manager", "Business Analyst", "Management Consultant"];
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #FBBF24 0%, #F59E0B 40%, #7C2D12 100%)" }}>
      {/* confetti */}
      {[...Array(40)].map((_, i) => (
        <motion.div key={i} initial={{ y: -50, x: `${Math.random()*100}%`, opacity: 0 }}
          animate={{ y: "110vh", opacity: [0,1,0], rotate: 360 }}
          transition={{ duration: 4 + Math.random()*3, repeat: Infinity, delay: Math.random()*3, ease: "linear" }}
          className="absolute h-3 w-3"
          style={{ background: ["#22C55E","#38BDF8","#FBBF24","#EC4899"][i%4], borderRadius: 2 }} />
      ))}

      <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border-4 p-7 text-center"
        style={{ background: "#FFFFFF", borderColor: "#1E293B", boxShadow: "0 18px 0 #1E293B, 0 40px 80px -10px rgba(0,0,0,0.5)" }}>
        <div className="text-6xl">🏆</div>
        <div className="font-display mt-2 text-3xl leading-tight sm:text-4xl" style={{ color: "#1E293B" }}>
          Business Explorer Badge Unlocked!
        </div>
        <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
          Well played, {name}. You've crossed Sun-Coin Atoll from lemonade to liftoff.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {skills.map((s) => (
            <div key={s.label} className="rounded-2xl border-2 p-3 text-left"
              style={{ borderColor: "#1E293B", background: "#FEF3C7", boxShadow: "0 4px 0 #1E293B" }}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "#FBBF24", border: "2px solid #1E293B", color: "#1E293B" }}>{s.icon}</div>
                <div className="font-display text-sm" style={{ color: "#1E293B" }}>{s.label}</div>
              </div>
              <div className="relative mt-2 h-2 rounded-full" style={{ background: "#E2E8F0" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1 }}
                  className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg,#22C55E,#FBBF24)" }} />
              </div>
              <div className="mt-1 text-right font-display text-xs" style={{ color: "#1E293B" }}>{s.value}/100</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border-2 p-4 text-left"
          style={{ borderColor: "#1E293B", background: "#F0FDF4" }}>
          <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#16A34A" }}>
            🧭 Recommended Career Paths
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {paths.map((p) => (
              <span key={p} className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "#22C55E", color: "#fff", border: "2px solid #1E293B", boxShadow: "0 2px 0 #1E293B" }}>
                {p}
              </span>
            ))}
          </div>
        </div>

        <button onClick={onFinish}
          className="font-display mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 uppercase tracking-wider"
          style={{ background: "linear-gradient(180deg,#FBBF24 0%,#F59E0B 100%)", color: "#1E293B",
            border: "3px solid #1E293B", boxShadow: "0 6px 0 #1E293B" }}>
          <Award className="h-5 w-5" /> Claim Badge & Continue
        </button>
      </motion.div>
    </motion.section>
  );
}

/* ============================================================
   RECOMMENDATION SCREEN
   ============================================================ */
function Recommendation() {
  const { runResult, setCurrentStep } = useAppState();
  const [data, setData] = useState<RunCompleteResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aggregate the per-world Discovery Run scores into a real AI recommendation
  // (POST /run/complete). Falls back to the local best-score pick if offline.
  useEffect(() => {
    if (!runResult) return;
    let cancelled = false;
    setLoading(true);
    api
      .runComplete({
        studentName: runResult.studentName,
        grade: runResult.grade,
        scores: runResult.scores,
      })
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [runResult]);

  if (!runResult) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#F8FAFC" }}>
        <button onClick={() => setCurrentStep("gameplay")}
          className="rounded-xl border-2 px-4 py-2"
          style={{ borderColor: "#1E293B", color: "#1E293B" }}>Back to run</button>
      </div>
    );
  }

  const recommendedWorld = (data?.recommended ?? runResult.recommended) as Career;
  const meta = CAREER_META[recommendedWorld];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ background: "#F8FAFC", color: "#1E293B" }}>
      <div className="w-full max-w-lg rounded-3xl border-4 p-7"
        style={{ background: "#FFFFFF", borderColor: "#1E293B", boxShadow: "0 18px 0 #1E293B" }}>
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6" style={{ color: meta.color }} />
          <div className="font-display text-[10px] uppercase tracking-[0.28em]" style={{ color: "#64748B" }}>
            🧭 Your Career Compass
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center" style={{ color: "#64748B" }}>
            <RefreshCw className="h-7 w-7 animate-spin" />
            <span className="font-display text-[11px] uppercase tracking-[0.3em]">Reading your run…</span>
          </div>
        ) : (
          <>
            <div className="font-display mt-2 text-3xl">
              {runResult.studentName}, your path points to{" "}
              <span style={{ color: meta.color }}>{meta.label}</span>
            </div>

            <div className="mt-3 flex items-start gap-3 rounded-2xl border-2 p-4"
              style={{ borderColor: "#1E293B", background: "#F0FDF4" }}>
              <Brain className="mt-0.5 h-5 w-5 flex-none" style={{ color: "#16A34A" }} />
              <p className="text-sm leading-snug" style={{ color: "#1E293B", fontFamily: "var(--font-serif-quest)" }}>
                {data?.message ??
                  `Great run, ${runResult.studentName}! You showed the strongest spark in the ${meta.short} world.`}
              </p>
            </div>

            {/* Per-world ranking */}
            <div className="mt-4 space-y-2">
              <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#64748B" }}>
                World Ranking
              </div>
              {(data?.ranking ??
                (Object.entries(runResult.scores) as [Career, number][])
                  .map(([world, score]) => ({ world, score }))
                  .sort((a, b) => b.score - a.score)
              ).map((r) => {
                const m = CAREER_META[r.world as Career];
                const max = Math.max(1, ...(data?.ranking ?? []).map((x) => x.score), ...Object.values(runResult.scores));
                return (
                  <div key={r.world} className="flex items-center gap-2">
                    <span className="w-28 flex-none text-xs font-medium" style={{ color: "#1E293B" }}>
                      {m.emoji} {m.short}
                    </span>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full" style={{ background: "#E2E8F0" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(r.score / max) * 100}%` }}
                        transition={{ duration: 0.7 }} className="h-full rounded-full" style={{ background: m.color }} />
                    </div>
                    <span className="w-8 flex-none text-right font-mono text-xs" style={{ color: "#64748B" }}>{r.score}</span>
                  </div>
                );
              })}
            </div>

            {/* Recommended careers (from the backend) */}
            {data?.recommendedCareers?.length ? (
              <div className="mt-4 rounded-2xl border-2 p-4"
                style={{ borderColor: "#1E293B", background: "#FEF3C7" }}>
                <div className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#B45309" }}>
                  Careers worth exploring next
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.recommendedCareers.map((c) => (
                    <span key={c} className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: meta.color, color: "#1E293B", border: "2px solid #1E293B", boxShadow: "0 2px 0 #1E293B" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {error && (
              <p className="mt-3 text-center text-[11px]" style={{ color: "#94A3B8" }}>
                (Showing a local estimate — the recommendation service was unreachable.)
              </p>
            )}
          </>
        )}

        <button onClick={() => setCurrentStep("welcome")}
          className="font-display mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 uppercase tracking-wider"
          style={{ background: "linear-gradient(180deg,#22C55E 0%,#16A34A 100%)", color: "#FFFFFF",
            border: "3px solid #1E293B", boxShadow: "0 6px 0 #1E293B" }}>
          Run Again <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.section>
  );
}
