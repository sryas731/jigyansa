import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage, Conversation } from "../backend.d";
import { useActor } from "./useActor";

// ── Query Keys ────────────────────────────────────────────
export const queryKeys = {
  isFirstTimeUser: ["isFirstTimeUser"] as const,
  isNameSet: ["isNameSet"] as const,
  userName: ["userName"] as const,
  conversationHistory: ["conversationHistory"] as const,
};

// ── Queries ───────────────────────────────────────────────

export function useIsFirstTimeUser() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: queryKeys.isFirstTimeUser,
    queryFn: async () => {
      if (!actor) return true;
      return actor.isFirstTimeUser(null);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useIsNameSet() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: queryKeys.isNameSet,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isNameSet(null);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useGetUserName() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: queryKeys.userName,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserName(null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversationHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Conversation[]>({
    queryKey: queryKeys.conversationHistory,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversationHistory(null);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ─────────────────────────────────────────────

export function useSetUserName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setUserName(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userName });
      queryClient.invalidateQueries({ queryKey: queryKeys.isNameSet });
    },
  });
}

export function useOnboardingComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.onboardingComplete(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.isFirstTimeUser });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (message: string): Promise<ChatMessage> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.sendMessage(message);
    },
  });
}

export function useClearConversationHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.clearConversationHistory(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversationHistory,
      });
    },
  });
}
