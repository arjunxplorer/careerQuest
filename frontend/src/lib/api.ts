/**
 * CareerQuest backend client.
 *
 * Thin, typed wrapper around the stateless Express API documented in
 * integration.md. The backend owns the Tavus key and returns ready-to-join
 * `conversationUrl`s, so the frontend never touches Tavus directly.
 *
 * Base URL is configurable via VITE_API_BASE (see .env). Falls back to the
 * local dev port so the app still works with zero config.
 */

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) || "http://localhost:3001";

export type WorldId =
  | "business"
  | "engineering"
  | "technology"
  | "medicine"
  | "creative";

/** A ready-to-join Tavus video, or a soft error when Tavus was unavailable. */
export type MentorVideoInfo =
  | { conversationUrl: string; conversationId: string }
  | { error: string };

export function hasVideo(
  v: MentorVideoInfo | undefined | null,
): v is { conversationUrl: string; conversationId: string } {
  return !!v && "conversationUrl" in v && typeof v.conversationUrl === "string";
}

/* ----------------------------- Challenges ----------------------------- */

export interface ChallengeOption {
  label: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface ChallengeDecision {
  id: string;
  prompt: string;
  type: "multiple_choice" | "binary_choice";
  options: ChallengeOption[];
}

export interface Challenge {
  id: string;
  world: WorldId;
  track: string;
  order: number;
  title: string;
  emoji: string;
  mentorName?: string;
  scenario: string;
  objective: string;
  skills: string[];
  decisions: ChallengeDecision[];
}

/* ------------------------------ Feedback ------------------------------ */

export interface BusinessSimulation {
  price: number;
  inventory: number;
  sign: boolean;
  advertise: boolean;
  demand: number;
  sales: number;
  leftover: number;
  lostCustomers: number;
  soldOut: boolean;
  revenue: number;
  inventoryCost: number;
  marketingCost: number;
  totalCost: number;
  profit: number;
}

export interface FeedbackResponse {
  sessionId: string;
  studentName: string;
  grade: number | null;
  world: WorldId;
  challengeId: string;
  challengeTitle: string;
  mentorName: string;
  score: number;
  simulation?: BusinessSimulation; // business only
  traits: Record<string, string>;
  feedback: string;
  video?: MentorVideoInfo;
}

export interface IntroSessionResponse {
  sessionId: string;
  mentorName: string;
  studentName: string;
  grade: number | null;
  video?: MentorVideoInfo;
}

export interface RunCompleteResponse {
  sessionId: string;
  studentName: string;
  grade: number | null;
  recommended: WorldId;
  ranking: { world: WorldId; score: number }[];
  recommendedWorlds: WorldId[];
  recommendedCareers: string[];
  message: string;
}

export interface PortalQuestionOption {
  label: string;
  text: string;
  isStrongChoice: boolean;
}

export interface PortalQuestionResponse {
  world: WorldId;
  field: string;
  level: number;
  theme: string;
  format: string;
  mentorName: string;
  grade: number;
  question: {
    id: string;
    text: string;
    options: PortalQuestionOption[];
  };
}

export interface PortalAnswerRecord {
  world: WorldId;
  questionId: string;
  questionText: string;
  answerLabel: string;
  answerText: string;
  level: number;
  theme: string;
  positive: boolean;
}

export interface RunDebriefResponse extends RunCompleteResponse {
  mentorName: string;
  feedback: string;
  video?: MentorVideoInfo;
}

/* ------------------------------- Core --------------------------------- */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (body && body.error) || `Request to ${path} failed (${res.status})`,
    );
  }
  return body as T;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  /** GET /:world/challenge — business is the deep version, others share the shape. */
  getChallenge: (world: WorldId) => request<Challenge>(`/${world}/challenge`),

  /** POST /:world/feedback — simulate + text feedback + (soft) Tavus video. */
  submitFeedback: (
    world: WorldId,
    body: {
      studentName: string;
      grade?: number;
      answers: Record<string, string>;
      testMode?: boolean;
    },
  ) =>
    request<FeedbackResponse>(`/${world}/feedback`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** POST /intro/session — live video with Ruby, the AI guide. */
  introSession: (body: {
    studentName: string;
    grade?: number;
    testMode?: boolean;
  }) =>
    request<IntroSessionResponse>("/intro/session", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** POST /session/end — end a Tavus conversation and free a concurrency slot. */
  endConversation: (conversationId: string) =>
    request<{ ok: true }>("/session/end", {
      method: "POST",
      body: JSON.stringify({ conversationId }),
    }),

  /** POST /run/complete — aggregate per-world scores → recommendation. */
  runComplete: (body: {
    studentName: string;
    grade?: number;
    scores: Partial<Record<WorldId, number>>;
  }) =>
    request<RunCompleteResponse>("/run/complete", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /play/portal-question/:world?grade=N — grade-level portal question. */
  getPortalQuestion: (world: WorldId, grade: number, excludeIds: string[] = []) =>
    request<PortalQuestionResponse>(
      `/play/portal-question/${world}?grade=${grade}${excludeIds.length ? `&exclude=${excludeIds.join(",")}` : ""}`,
    ),

  /** POST /run/debrief — Career Compass + character-specific mentor video. */
  runDebrief: (body: {
    studentName: string;
    grade?: number;
    scores: Partial<Record<WorldId, number>>;
    correctCount: number;
    requiredCount: number;
    portalAnswers: PortalAnswerRecord[];
    testMode?: boolean;
  }) =>
    request<RunDebriefResponse>("/run/debrief", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
