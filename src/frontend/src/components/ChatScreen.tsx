import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MoreVertical, Send, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Variant_user_jigyansa } from "../backend.d";
import type { ChatMessage } from "../backend.d";
import {
  useClearConversationHistory,
  useGetConversationHistory,
  useGetUserName,
  useSendMessage,
} from "../hooks/useQueries";

interface LocalMessage {
  id: string;
  text: string;
  type: "user" | "jigyansa";
  timestamp: number;
}

const WELCOME_MESSAGE: LocalMessage = {
  id: "welcome",
  text: "Heyy! Kitne dino baad! 😄 Kya chal raha hai life mein? Bata, main hoon yahan — sunne ke liye, hasne ke liye, ya bas timepass ke liye bhi! 💕",
  type: "jigyansa",
  timestamp: Date.now(),
};

function historyToLocalMessages(
  conversations: { messages: ChatMessage[]; timestamp: bigint }[],
): LocalMessage[] {
  const allMessages: LocalMessage[] = [];
  for (const conv of conversations) {
    for (const msg of conv.messages) {
      allMessages.push({
        id: `${msg.timestamp.toString()}-${msg.messageType}`,
        text: msg.text,
        type:
          msg.messageType === Variant_user_jigyansa.user ? "user" : "jigyansa",
        timestamp: Number(msg.timestamp),
      });
    }
  }
  // Sort by timestamp ascending
  allMessages.sort((a, b) => a.timestamp - b.timestamp);
  return allMessages;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: history, isLoading: historyLoading } =
    useGetConversationHistory();
  const { data: userName } = useGetUserName();
  const { mutateAsync: sendMessage, isPending: sending } = useSendMessage();
  const { mutateAsync: clearHistory, isPending: clearing } =
    useClearConversationHistory();

  // Load history on mount
  useEffect(() => {
    if (historyLoading || historyLoaded) return;
    if (history !== undefined) {
      setHistoryLoaded(true);
      if (history.length === 0) {
        setMessages([WELCOME_MESSAGE]);
      } else {
        const localMsgs = historyToLocalMessages(history);
        setMessages(localMsgs.length > 0 ? localMsgs : [WELCOME_MESSAGE]);
      }
    }
  }, [history, historyLoading, historyLoaded]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages/isTyping changes trigger scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || isTyping) return;

    const userMsg: LocalMessage = {
      id: `user-${Date.now()}`,
      text,
      type: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await sendMessage(text);
      const jigyansaMsg: LocalMessage = {
        id: `jigyansa-${response.timestamp.toString()}`,
        text: response.text,
        type: "jigyansa",
        timestamp: Number(response.timestamp),
      };
      setMessages((prev) => [...prev, jigyansaMsg]);
    } catch {
      toast.error(
        "Arre yaar, kuch gadbad ho gayi! Thodi der baad try karo. 😅",
      );
      // Remove the user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInputText(text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setMessages([
        {
          ...WELCOME_MESSAGE,
          id: `welcome-${Date.now()}`,
          text: "Okay, fresh start! Sab kuch bhool gaye 😄 Ab baat karo — kya chal raha hai? 🌸",
          timestamp: Date.now(),
        },
      ]);
      toast.success("Chat history clear ho gayi! 🧹");
    } catch {
      toast.error("Clear nahi ho paya, baad mein try karo! 😅");
    }
  };

  const displayName = userName || "Tum";

  return (
    <div
      className="flex flex-col h-screen max-h-screen overflow-hidden"
      style={{ background: "oklch(var(--chat-bg))" }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b"
        style={{
          background: "oklch(var(--header-bg))",
          borderColor: "oklch(var(--header-border))",
          boxShadow: "0 1px 12px 0 rgba(0,0,0,0.06)",
        }}
      >
        {/* Avatar */}
        <div className="relative">
          <Avatar
            className="w-10 h-10 ring-2"
            style={
              {
                "--tw-ring-color": "oklch(0.88 0.08 20)",
              } as React.CSSProperties
            }
          >
            <AvatarImage
              src="/assets/generated/jigyansa-avatar.dim_200x200.png"
              alt="Jigyansa"
            />
            <AvatarFallback
              className="font-display font-bold text-sm"
              style={{
                background: "oklch(var(--jigyansa-bubble))",
                color: "oklch(var(--jigyansa-bubble-foreground))",
              }}
            >
              J
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white"
            style={{ background: "oklch(var(--online))" }}
          />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <h1
            className="font-display font-bold text-base leading-tight truncate"
            style={{ color: "oklch(var(--foreground))" }}
          >
            Jigyansa
          </h1>
          <p
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "oklch(var(--online))" }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "oklch(var(--online))" }}
            />
            Online — hamesha tumhare liye! 💕
          </p>
        </div>

        {/* Greeting chip */}
        <span
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: "oklch(var(--jigyansa-bubble))",
            color: "oklch(var(--jigyansa-bubble-foreground))",
          }}
        >
          <Heart className="w-3 h-3" />
          Hi {displayName}!
        </span>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl flex-shrink-0"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  data-ocid="chat.clear_button"
                  className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="w-4 h-4" />
                  Chat clear karo
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display font-bold">
                    Sab bhool jayegi? 😢
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Ek baar clear karoge toh saari purani baatein chali
                    jaayengi. Pakka karna hai?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid="chat.cancel_button"
                    className="rounded-xl"
                  >
                    Nahi, rehe do
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="chat.confirm_button"
                    onClick={() => void handleClearHistory()}
                    disabled={clearing}
                    className="rounded-xl"
                    style={{ background: "oklch(var(--destructive))" }}
                  >
                    {clearing ? "Clear ho raha hai..." : "Haan, clear karo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Messages area ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-2">
        {historyLoading && !historyLoaded ? (
          <div
            data-ocid="chat.loading_state"
            className="flex flex-col gap-3 py-4"
          >
            {/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items */}
            {[...Array(4)].map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                key={i}
                className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 animate-pulse"
                  style={{ background: "oklch(0.88 0.05 20 / 0.5)" }}
                />
                <div
                  className="h-10 rounded-2xl animate-pulse"
                  style={{
                    background: "oklch(0.88 0.05 20 / 0.4)",
                    width: `${40 + ((i * 15) % 40)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={index + 1}
                showAvatar={
                  msg.type === "jigyansa" &&
                  (index === 0 || messages[index - 1]?.type !== "jigyansa")
                }
              />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                key="typing"
                data-ocid="chat.loading_state"
                className="flex items-end gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
              >
                <Avatar className="w-8 h-8 flex-shrink-0 shadow-xs">
                  <AvatarImage
                    src="/assets/generated/jigyansa-avatar.dim_200x200.png"
                    alt="Jigyansa"
                  />
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{
                      background: "oklch(var(--jigyansa-bubble))",
                      color: "oklch(var(--jigyansa-bubble-foreground))",
                    }}
                  >
                    J
                  </AvatarFallback>
                </Avatar>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-bubble"
                  style={{ background: "oklch(var(--jigyansa-bubble))" }}
                >
                  <span
                    className="typing-dot w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        "oklch(var(--jigyansa-bubble-foreground) / 0.6)",
                    }}
                  />
                  <span
                    className="typing-dot w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        "oklch(var(--jigyansa-bubble-foreground) / 0.6)",
                    }}
                  />
                  <span
                    className="typing-dot w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        "oklch(var(--jigyansa-bubble-foreground) / 0.6)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* ── Input area ─────────────────────────────────── */}
      <footer
        className="flex-shrink-0 border-t px-3 py-3"
        style={{
          background: "oklch(var(--header-bg))",
          borderColor: "oklch(var(--header-border))",
        }}
      >
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              data-ocid="chat.input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kuch bolo... 😊"
              disabled={sending || isTyping}
              rows={1}
              className="resize-none rounded-2xl px-4 py-3 min-h-[48px] max-h-[120px] text-sm font-medium border-border focus-visible:ring-primary leading-relaxed input-jigyansa"
              style={{ overflowY: "auto" }}
            />
          </div>
          <Button
            data-ocid="chat.send_button"
            onClick={() => void handleSend()}
            disabled={!inputText.trim() || sending || isTyping}
            size="icon"
            className="w-12 h-12 rounded-2xl flex-shrink-0 transition-all duration-200 active:scale-95"
            style={{
              background:
                inputText.trim() && !sending && !isTyping
                  ? "oklch(var(--primary))"
                  : "oklch(var(--muted))",
              color:
                inputText.trim() && !sending && !isTyping
                  ? "oklch(var(--primary-foreground))"
                  : "oklch(var(--muted-foreground))",
            }}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p
          className="text-center text-xs mt-2"
          style={{ color: "oklch(0.65 0.03 40)" }}
        >
          Enter bhejo • Shift+Enter naya line
        </p>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  );
}

// ── Message Bubble Component ───────────────────────────────

interface MessageBubbleProps {
  message: LocalMessage;
  index: number;
  showAvatar: boolean;
}

function MessageBubble({ message, index, showAvatar }: MessageBubbleProps) {
  const isJigyansa = message.type === "jigyansa";

  return (
    <motion.div
      data-ocid={`chat.item.${index}`}
      className={`flex items-end gap-2 ${isJigyansa ? "" : "flex-row-reverse"}`}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {/* Avatar (only for Jigyansa, only on first in a sequence) */}
      {isJigyansa ? (
        <div className="w-8 flex-shrink-0 self-end">
          {showAvatar ? (
            <Avatar className="w-8 h-8 shadow-xs">
              <AvatarImage
                src="/assets/generated/jigyansa-avatar.dim_200x200.png"
                alt="Jigyansa"
              />
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: "oklch(var(--jigyansa-bubble))",
                  color: "oklch(var(--jigyansa-bubble-foreground))",
                }}
              >
                J
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      ) : null}

      {/* Bubble */}
      <div
        className={`
          relative max-w-[78%] sm:max-w-[65%] px-4 py-2.5 text-sm font-medium leading-relaxed shadow-bubble
          ${
            isJigyansa
              ? "rounded-2xl rounded-bl-sm"
              : "rounded-2xl rounded-br-sm"
          }
        `}
        style={
          isJigyansa
            ? {
                background: "oklch(var(--jigyansa-bubble))",
                color: "oklch(var(--jigyansa-bubble-foreground))",
              }
            : {
                background: "oklch(var(--user-bubble))",
                color: "oklch(var(--user-bubble-foreground))",
              }
        }
      >
        {message.text}
      </div>
    </motion.div>
  );
}
