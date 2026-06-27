import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VideoOff, Loader2 } from "lucide-react";

/**
 * Live Tavus mentor video via the Daily JS SDK (auto-join).
 *
 * We deliberately do NOT embed the raw Tavus `conversationUrl` in an <iframe>,
 * which would show Daily's "Join" prejoin screen. Instead we create a call
 * object and `join()` so the replica (Ruby / Sam Park / world mentor) appears
 * and starts talking automatically. See integration.md Section 6.
 *
 * daily-js is imported dynamically inside the effect so it never runs during
 * TanStack Start's server render (it touches browser globals at import time).
 */

type Status = "connecting" | "live" | "needs-unmute" | "error";

// Minimal shape of the Daily call object we use (avoids a hard type dep).
type DailyCall = {
  on: (ev: string, cb: (e: unknown) => void) => void;
  join: (opts: Record<string, unknown>) => Promise<unknown>;
  leave: () => Promise<unknown>;
  destroy: () => Promise<unknown>;
};

export function MentorVideo({
  conversationUrl,
  studentName,
  className = "",
  startAudioOff = false,
  onSpeechEnd,
  onError,
}: {
  conversationUrl: string;
  studentName: string;
  className?: string;
  /** Mute the student's mic — use for one-way intros where they don't talk. */
  startAudioOff?: boolean;
  /** Fired once the mentor finishes speaking (e.g. after a scripted greeting). */
  onSpeechEnd?: () => void;
  /** Fired when Daily join or stream fails. */
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [status, setStatus] = useState<Status>("connecting");

  // Keep the latest onSpeechEnd without re-running the join effect.
  const onSpeechEndRef = useRef(onSpeechEnd);
  onSpeechEndRef.current = onSpeechEnd;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!conversationUrl || typeof window === "undefined") return;

    let cancelled = false;
    const stream = new MediaStream();
    const videoEl = videoRef.current;
    if (videoEl) videoEl.srcObject = stream;

    // Track the mentor's speaking state so we can detect when the greeting
    // ends. Tavus CVI broadcasts speaking events over Daily app-messages.
    let replicaSpoke = false;
    let speechEndTimer: ReturnType<typeof setTimeout> | null = null;
    let speechEndFired = false;
    const fireSpeechEnd = () => {
      if (speechEndFired) return;
      speechEndFired = true;
      onSpeechEndRef.current?.();
    };

    (async () => {
      try {
        const { default: DailyIframe } = await import("@daily-co/daily-js");
        if (cancelled) return;

        const call = DailyIframe.createCallObject({
          subscribeToTracksAutomatically: true,
        }) as unknown as DailyCall;
        callRef.current = call;

        call.on("track-started", (raw: unknown) => {
          const ev = raw as {
            participant?: { local?: boolean };
            track?: MediaStreamTrack;
          };
          // Only render the remote replica (mentor), not the local student.
          if (!ev.participant || ev.participant.local || !ev.track) return;
          stream.addTrack(ev.track);
          if (!videoRef.current) return;
          setStatus("live");
          videoRef.current.play().catch(() => {
            setStatus("needs-unmute");
          });
          // Fallback end for one-way intros only after video is actually playing.
          if (onSpeechEndRef.current && !speechEndTimer) {
            speechEndTimer = setTimeout(fireSpeechEnd, 50000);
          }
        });

        // Detect end-of-greeting for one-way intros (only after replica video is live).
        if (onSpeechEndRef.current) {
          call.on("app-message", (raw: unknown) => {
            const data = (raw as { data?: { event_type?: string } })?.data;
            const et = data?.event_type;
            if (typeof et !== "string" || !et.includes("replica")) return;
            if (et.includes("started_speaking")) {
              replicaSpoke = true;
              if (speechEndTimer) {
                clearTimeout(speechEndTimer);
                speechEndTimer = null;
              }
            } else if (et.includes("stopped_speaking") && replicaSpoke) {
              if (speechEndTimer) clearTimeout(speechEndTimer);
              speechEndTimer = setTimeout(fireSpeechEnd, 2200);
            }
          });
        }

        // If the replica leaves, the conversation is over.
        call.on("participant-left", (raw: unknown) => {
          const ev = raw as { participant?: { local?: boolean } };
          if (ev.participant && !ev.participant.local) fireSpeechEnd();
        });

        call.on("error", () => {
          if (!cancelled) {
            setStatus("error");
            onErrorRef.current?.();
          }
        });

        await call.join({
          url: conversationUrl,
          userName: studentName,
          startVideoOff: true,
          startAudioOff,
        });
      } catch {
        if (!cancelled) {
          setStatus("error");
          onErrorRef.current?.();
        }
      }
    })();

    return () => {
      cancelled = true;
      if (speechEndTimer) clearTimeout(speechEndTimer);
      const call = callRef.current;
      callRef.current = null;
      if (call) {
        call.leave().catch(() => {});
        call.destroy().catch(() => {});
      }
    };
  }, [conversationUrl, studentName, startAudioOff]);

  const unmute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.play()
      .then(() => setStatus("live"))
      .catch(() => setStatus("needs-unmute"));
  };

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full bg-black object-cover"
      />

      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,oklch(0.32_0.08_220/0.4),oklch(0.1_0.03_220)_70%)] text-[oklch(0.85_0.06_220)]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-display text-xs uppercase tracking-[0.3em]">
            Opening live channel…
          </span>
        </div>
      )}

      {status === "needs-unmute" && (
        <button
          onClick={unmute}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 text-white backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40"
          >
            <Volume2 className="h-8 w-8" />
          </motion.div>
          <span className="font-display text-sm uppercase tracking-[0.25em]">
            Tap to unmute your mentor
          </span>
        </button>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[oklch(0.18_0.03_30)] px-6 text-center text-white/80">
          <VideoOff className="h-8 w-8 opacity-70" />
          <span className="font-display text-xs uppercase tracking-[0.25em]">
            Live mentor unavailable
          </span>
          <span className="text-xs text-white/60">
            No worries — read the written coaching below.
          </span>
        </div>
      )}
    </div>
  );
}
