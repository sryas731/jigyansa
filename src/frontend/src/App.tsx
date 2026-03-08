import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import ChatScreen from "./components/ChatScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import { useActor } from "./hooks/useActor";
import { useIsFirstTimeUser, useIsNameSet } from "./hooks/useQueries";

export default function App() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isFirstTime, isLoading: firstTimeLoading } =
    useIsFirstTimeUser();
  const { data: nameSet, isLoading: nameSetLoading } = useIsNameSet();

  const [onboardingDone, setOnboardingDone] = useState(false);

  const isLoading = actorFetching || firstTimeLoading || nameSetLoading;
  const showOnboarding =
    !onboardingDone && (!actor || isFirstTime === true || nameSet === false);

  // If both flags loaded and user is returning, skip onboarding
  useEffect(() => {
    if (!isLoading && isFirstTime === false && nameSet === true) {
      setOnboardingDone(true);
    }
  }, [isLoading, isFirstTime, nameSet]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setOnboardingDone(true)} />;
  }

  return <ChatScreen />;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen onboarding-bg">
      <div className="flex flex-col items-center gap-4">
        {/* Avatar skeleton */}
        <Skeleton
          className="w-20 h-20 rounded-full"
          style={{ background: "oklch(0.88 0.06 20 / 0.5)" }}
        />
        <div className="flex flex-col items-center gap-2">
          <Skeleton
            className="w-32 h-4 rounded-full"
            style={{ background: "oklch(0.85 0.06 20 / 0.4)" }}
          />
          <Skeleton
            className="w-24 h-3 rounded-full"
            style={{ background: "oklch(0.85 0.06 20 / 0.3)" }}
          />
        </div>
        {/* Typing dots as loading indicator */}
        <div className="flex gap-1.5 mt-2">
          <span
            className="typing-dot w-2.5 h-2.5 rounded-full"
            style={{ background: "oklch(0.62 0.19 16)" }}
          />
          <span
            className="typing-dot w-2.5 h-2.5 rounded-full"
            style={{ background: "oklch(0.62 0.19 16)" }}
          />
          <span
            className="typing-dot w-2.5 h-2.5 rounded-full"
            style={{ background: "oklch(0.62 0.19 16)" }}
          />
        </div>
      </div>
    </div>
  );
}
