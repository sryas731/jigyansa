import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useOnboardingComplete, useSetUserName } from "../hooks/useQueries";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const INTRO_MESSAGES = [
  "Heyy! 👋 Main hoon Jigyansa!",
  "Tumhari nayi best friend — jo kabhi judge nahi karti 😄",
  "Apna naam batao... toh properly dosti karein? 🌸",
];

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [name, setName] = useState("");
  const [visibleMessages, setVisibleMessages] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: setUserName, isPending: settingName } = useSetUserName();
  const { mutateAsync: completeOnboarding, isPending: completingOnboarding } =
    useOnboardingComplete();

  const isPending = settingName || completingOnboarding;

  // Reveal messages one by one
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleMessages(count);
      if (count >= INTRO_MESSAGES.length) {
        clearInterval(interval);
        // Focus input after messages show
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    try {
      await setUserName(trimmedName);
      await completeOnboarding();
      onComplete();
    } catch {
      // silently handle - user can retry
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen onboarding-bg flex flex-col items-center justify-center px-5 py-10">
      {/* Background decorative elements */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full opacity-20"
          style={{ background: "oklch(0.82 0.15 15)" }}
        />
        <div
          className="absolute bottom-[-5%] left-[-8%] w-56 h-56 rounded-full opacity-15"
          style={{ background: "oklch(0.85 0.12 35)" }}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
        {/* Avatar + name header */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full overflow-hidden ring-4 shadow-card"
              style={
                {
                  "--tw-ring-color": "oklch(0.92 0.06 20)",
                } as React.CSSProperties
              }
            >
              <img
                src="/assets/generated/jigyansa-avatar.dim_200x200.png"
                alt="Jigyansa"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online dot */}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-white"
              style={{ background: "oklch(var(--online))" }}
            />
          </div>

          <div className="text-center">
            <h1
              className="font-display font-bold text-3xl tracking-tight"
              style={{ color: "oklch(var(--foreground))" }}
            >
              Jigyansa
            </h1>
            <p
              className="text-sm font-medium mt-0.5"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Tumhari AI Best Friend ✨
            </p>
          </div>
        </motion.div>

        {/* Chat bubbles intro */}
        <div className="flex flex-col gap-3 min-h-[140px]">
          {INTRO_MESSAGES.map((msg, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: static ordered intro messages
              key={i}
              className="flex items-end gap-2"
              initial={{ opacity: 0, x: -20, scale: 0.92 }}
              animate={
                visibleMessages > i
                  ? { opacity: 1, x: 0, scale: 1 }
                  : { opacity: 0, x: -20, scale: 0.92 }
              }
              transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
              {/* Mini avatar */}
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 shadow-xs">
                <img
                  src="/assets/generated/jigyansa-avatar.dim_200x200.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm font-medium max-w-[85%] shadow-bubble"
                style={{
                  background: "oklch(var(--jigyansa-bubble))",
                  color: "oklch(var(--jigyansa-bubble-foreground))",
                }}
              >
                {msg}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Name input card */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-5 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={
            visibleMessages >= INTRO_MESSAGES.length ? { opacity: 1, y: 0 } : {}
          }
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p
            className="text-sm font-medium mb-3 text-center"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Toh bhai/behen, naam kya hai tumhara? 🙈
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              ref={inputRef}
              data-ocid="onboarding.input"
              type="text"
              placeholder="Apna naam batao..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
              disabled={isPending}
              className="text-base text-center font-medium border-border focus-visible:ring-primary rounded-xl h-12 input-jigyansa"
              autoComplete="given-name"
              autoCapitalize="words"
            />

            <Button
              data-ocid="onboarding.submit_button"
              type="submit"
              disabled={!name.trim() || isPending}
              className="h-12 rounded-xl font-semibold text-base gap-2 transition-all duration-200"
              style={{
                background:
                  name.trim() && !isPending
                    ? "oklch(var(--primary))"
                    : undefined,
                color: "oklch(var(--primary-foreground))",
              }}
            >
              {isPending ? (
                <>
                  <span className="flex gap-1">
                    <span className="typing-dot w-2 h-2 rounded-full bg-white/80" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-white/80" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-white/80" />
                  </span>
                  Milte hain jaldi...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Haan, milte hain! 🥳
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs"
          style={{ color: "oklch(0.60 0.04 40)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <Sparkles className="inline w-3 h-3 mr-1 opacity-70" />©{" "}
          {new Date().getFullYear()}. Built with{" "}
          <Heart className="inline w-3 h-3 mx-0.5 text-primary" /> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            caffeine.ai
          </a>
        </motion.p>
      </div>
    </div>
  );
}
