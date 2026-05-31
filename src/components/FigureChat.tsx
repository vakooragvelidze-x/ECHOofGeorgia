"use client";

import type { Figure } from "@/data/figures";
import { createClient } from "@/lib/supabase/client";
import {
  Bot,
  Clock3,
  LogIn,
  Menu,
  Plus,
  Send,
  Square,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  KeyboardEvent,
  MouseEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type ChatMode = "factual" | "living";
type AuthStatus = "loading" | "guest" | "user";

type LimitNotice = {
  title: string;
  description: string;
  type: "guest" | "free";
};

type ChatErrorResponse = {
  code?: string;
  error?: string;
  message?: string;
  limit?: number;
  used?: number;
  plan?: string;
};

type SavedConversation = {
  id: string;
  figure_slug: string;
  title: string;
  chat_mode?: ChatMode;
  created_at: string;
  updated_at: string;
};

type SavedMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type StableAssistantAvatarProps = {
  src?: string;
  alt: string;
};

type ThinkingCues = {
  immediate: string;
  delayed: string;
  longWait: string;
};

const GUEST_FREE_LIMIT = 5;
const GUEST_USAGE_KEY = "echo_georgia_guest_questions_used";

const chatModeLabels: Record<ChatMode, string> = {
  factual: "ფაქტობრივი",
  living: "ცოცხალი საუბარი",
};

const chatModeShortLabels: Record<ChatMode, string> = {
  factual: "ფაქტობრივი",
  living: "ცოცხალი",
};

const chatModeDescriptions: Record<ChatMode, string> = {
  factual: "ისტორიულად ფრთხილი პასუხები — ფაქტებზე, ცნობილ წყაროებზე და დადასტურებულ ინფორმაციაზე დაყრდნობით.",
  living: "თავისუფალი საუბარი პერსონაჟის ხმით — უფრო ემოციური, აზრიანი და ინტერპრეტაციული პასუხებისთვის.",
};

const StableAssistantAvatar = memo(function StableAssistantAvatar({
  src,
  alt,
}: StableAssistantAvatarProps) {
  if (src) {
    return (
      <div
        aria-label={alt}
        role="img"
        className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#c9a45c]/30 bg-[#171010] bg-cover bg-center [backface-visibility:hidden] [transform:translateZ(0)]"
        style={{
          backgroundImage: `url("${src}")`,
          WebkitTransform: "translateZ(0)",
        }}
      />
    );
  }

  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 text-[#c9a45c]">
      <Bot size={16} />
    </div>
  );
});

function getGuestUsageCount() {
  if (typeof window === "undefined") return 0;

  const storedValue = window.localStorage.getItem(GUEST_USAGE_KEY);
  const parsedValue = Number.parseInt(storedValue ?? "0", 10);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function setGuestUsageCount(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_USAGE_KEY, String(value));
}

function formatSavedConversationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ka-GE", {
    month: "short",
    day: "numeric",
  });
}

function pickSuggestedQuestions(questions: string[], figureSlug: string) {
  if (typeof window === "undefined") {
    return questions.slice(0, 3);
  }

  if (questions.length <= 3) {
    return questions;
  }

  const storageKey = `echo_suggested_questions_${figureSlug}`;
  const previousValue = window.sessionStorage.getItem(storageKey);

  let previousQuestions: string[] = [];

  try {
    previousQuestions = previousValue ? JSON.parse(previousValue) : [];
  } catch {
    previousQuestions = [];
  }

  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  let selected = shuffled.slice(0, 3);

  const isSameAsPrevious =
    previousQuestions.length === selected.length &&
    selected.every((question) => previousQuestions.includes(question));

  if (isSameAsPrevious) {
    selected = shuffled.slice(1, 4);

    if (selected.length < 3) {
      selected = [...selected, shuffled[0]];
    }
  }

  window.sessionStorage.setItem(storageKey, JSON.stringify(selected));

  return selected;
}

function getThinkingCues(message: string, figureSlug: string): ThinkingCues {
  const normalized = message.trim().toLowerCase();

  const isCasual =
    normalized.includes("როგორ ხარ") ||
    normalized.includes("როგორხარ") ||
    normalized.includes("გამარჯობა") ||
    normalized.includes("სალამი") ||
    normalized.includes("რა ხდება") ||
    normalized.includes("რას შვები") ||
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("hey");

  const isEmotional =
    normalized.includes("ცუდ") ||
    normalized.includes("მეშინ") ||
    normalized.includes("დავიღალე") ||
    normalized.includes("მიჭირს") ||
    normalized.includes("ვერ ვგრძნობ") ||
    normalized.includes("არ ვიცი რა ვქნა") ||
    normalized.includes("დეპრეს") ||
    normalized.includes("მტკივა");

  const isDeep =
    normalized.includes("რატომ") ||
    normalized.includes("ამიხსენი") ||
    normalized.includes("გაანალიზე") ||
    normalized.includes("რას ფიქრობ") ||
    normalized.includes("რა აზრის ხარ") ||
    normalized.includes("ფილოსოფ") ||
    normalized.length > 180;

  const isFactual =
    normalized.includes("ვინ") ||
    normalized.includes("როდის") ||
    normalized.includes("სად") ||
    normalized.includes("რამდენ") ||
    normalized.includes("მართალია") ||
    normalized.includes("ფაქტი");

  if (isCasual) {
    return {
      immediate: "გისმენ",
      delayed: "მოკლედ გიპასუხებ",
      longWait: "აქ ვარ",
    };
  }

  if (isEmotional) {
    return {
      immediate: "გისმენ",
      delayed: "მესმის, ამას ფრთხილად ვუპასუხებ",
      longWait: "სწორ სიტყვას ვეძებ",
    };
  }

  if (isFactual) {
    return {
      immediate: "ვფიქრობ",
      delayed: "ვამოწმებ, რომ სწორად გიპასუხო",
      longWait: "ფაქტებს ვალაგებ",
    };
  }

  if (isDeep) {
    return {
      immediate: "ვფიქრობ",
      delayed: "კარგი კითხვაა, პასუხს ვალაგებ",
      longWait: "მთავარს ვეძებ",
    };
  }

  if (figureSlug === "ilia-chavchavadze") {
    return {
      immediate: "ვფიქრობ",
      delayed: "პირდაპირ გიპასუხებ",
      longWait: "სიტყვას ვარჩევ",
    };
  }

  if (figureSlug === "tamar-mepe") {
    return {
      immediate: "ვფიქრობ",
      delayed: "სიტყვას ვწონი",
      longWait: "ფრთხილად გიპასუხებ",
    };
  }

  if (figureSlug === "vazha-pshavela") {
    return {
      immediate: "ვფიქრობ",
      delayed: "პირდაპირ გეტყვი",
      longWait: "ღრმად ვფიქრობ",
    };
  }

  if (figureSlug === "shota-rustaveli") {
    return {
      immediate: "ვფიქრობ",
      delayed: "სიტყვას ვეძებ",
      longWait: "აზრს ვალაგებ",
    };
  }

  if (figureSlug === "niko-pirosmani") {
    return {
      immediate: "გისმენ",
      delayed: "ნელა გიპასუხებ",
      longWait: "სწორ ფერს ვეძებ",
    };
  }

  return {
    immediate: "ვფიქრობ",
    delayed: "პასუხს ვალაგებ",
    longWait: "მალე გიპასუხებ",
  };
}

export default function FigureChat({ figure }: { figure: Figure }) {
  const initialAssistantMessage: Message = {
    id: 1,
    role: "assistant",
    text:
      figure.greeting ??
      `გამარჯობა, მე ${figure.nameKa} ვარ. მკითხე, რა გაინტერესებს.`,
  };

  const avatarImage = figure.iconImage ?? figure.image;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    initialAssistantMessage,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [slowThinkingText, setSlowThinkingText] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [guestUsageCount, setGuestUsageCountState] = useState(0);
  const [limitNotice, setLimitNotice] = useState<LimitNotice | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>("factual");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [savedConversations, setSavedConversations] = useState<
    SavedConversation[]
  >([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedConversation | null>(
    null
  );

  const chatRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number | null>(null);
  const slowThinkingTimerRef = useRef<number | null>(null);
  const longThinkingTimerRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const element = chatRef.current;
      if (!element) return;

      element.scrollTop = element.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingMessageId, scrollToBottom]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [input]);

  useEffect(() => {
    setSuggestedQuestions(pickSuggestedQuestions(figure.questions, figure.slug));
  }, [figure.questions, figure.slug]);

  useEffect(() => {
    const supabase = createClient();

    setGuestUsageCountState(getGuestUsageCount());

    supabase.auth
      .getUser()
      .then(async ({ data, error }) => {
        if (error || !data.user) {
          await supabase.auth.signOut();
          setAuthStatus("guest");
          setSavedConversations([]);
          setActiveConversationId(null);
          return;
        }

        setAuthStatus("user");
        void loadConversations();
      })
      .catch(async () => {
        await supabase.auth.signOut();
        setAuthStatus("guest");
        setSavedConversations([]);
        setActiveConversationId(null);
      });

    return () => {
      stopGeneration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConversations() {
    setIsLoadingConversations(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        const supabase = createClient();

        await supabase.auth.signOut();

        setAuthStatus("guest");
        setSavedConversations([]);
        setActiveConversationId(null);
        return;
      }

      if (!response.ok) {
        console.warn("Failed to load conversations:", response.status);
        setSavedConversations([]);
        return;
      }

      const data = (await response.json()) as {
        conversations?: SavedConversation[];
      };

      const currentFigureConversations = (data.conversations ?? []).filter(
        (conversation) => conversation.figure_slug === figure.slug
      );

      setSavedConversations(currentFigureConversations);
    } catch (error) {
      console.warn("Load conversations warning:", error);
      setSavedConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }

  async function createConversation(firstMessage = "") {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        figureSlug: figure.slug,
        firstMessage,
        chatMode,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create conversation.");
    }

    const data = (await response.json()) as {
      conversation?: SavedConversation;
    };

    if (!data.conversation?.id) {
      throw new Error("Conversation was not returned.");
    }

    setActiveConversationId(data.conversation.id);

    setSavedConversations((current) => {
      const withoutDuplicate = current.filter(
        (conversation) => conversation.id !== data.conversation?.id
      );

      return [data.conversation!, ...withoutDuplicate];
    });

    return data.conversation.id;
  }

  async function updateConversationTitleFromFirstMessage(
    conversationId: string,
    firstMessage: string
  ) {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          firstMessage,
        }),
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        conversation?: SavedConversation;
      };

      if (!data.conversation) {
        return;
      }

      setSavedConversations((current) => {
        const withoutUpdated = current.filter(
          (conversation) => conversation.id !== data.conversation?.id
        );

        return [data.conversation!, ...withoutUpdated];
      });
    } catch (error) {
      console.warn("Conversation title update warning:", error);
    }
  }

  async function openConversation(conversationId: string) {
    if (isLoading || isOpeningConversation) return;

    stopGeneration();
    setIsOpeningConversation(true);
    setLimitNotice(null);
    setIsModeMenuOpen(false);
    setIsMobileSidebarOpen(false);

    const openedConversation = savedConversations.find(
      (conversation) => conversation.id === conversationId
    );

    if (
      openedConversation?.chat_mode === "living" ||
      openedConversation?.chat_mode === "factual"
    ) {
      setChatMode(openedConversation.chat_mode);
    }

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load messages.");
      }

      const data = (await response.json()) as {
        messages?: SavedMessage[];
      };

      const loadedMessages: Message[] = (data.messages ?? []).map(
        (message, index) => ({
          id: Date.now() + index,
          role: message.role,
          text: message.content,
        })
      );

      setActiveConversationId(conversationId);
      setInput("");
      setMessages(
        loadedMessages.length > 0
          ? [initialAssistantMessage, ...loadedMessages]
          : [initialAssistantMessage]
      );
    } catch (error) {
      console.error("Open conversation error:", error);
    } finally {
      setIsOpeningConversation(false);
    }
  }

  async function deleteConversationById(
    conversationId: string,
    shouldResetActive = true
  ) {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to delete conversation.");
    }

    setSavedConversations((current) =>
      current.filter((conversation) => conversation.id !== conversationId)
    );

    if (shouldResetActive && activeConversationId === conversationId) {
      startNewChat();
    }
  }

  function requestDeleteConversation(conversation: SavedConversation) {
    if (isLoading || isOpeningConversation) return;
    setDeleteTarget(conversation);
  }

  async function confirmDeleteConversation() {
    if (!deleteTarget) return;

    const conversationId = deleteTarget.id;

    setDeleteTarget(null);

    try {
      await deleteConversationById(conversationId);
    } catch (error) {
      console.error("Delete conversation error:", error);
    }
  }

  function clearSlowThinkingTimer() {
    if (slowThinkingTimerRef.current) {
      window.clearTimeout(slowThinkingTimerRef.current);
      slowThinkingTimerRef.current = null;
    }

    if (longThinkingTimerRef.current) {
      window.clearTimeout(longThinkingTimerRef.current);
      longThinkingTimerRef.current = null;
    }

    setSlowThinkingText(null);
  }

  function stopGeneration() {
    activeRequestIdRef.current = null;
    clearSlowThinkingTimer();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setTypingMessageId(null);
    setIsLoading(false);
  }

  function startNewChat() {
    stopGeneration();
    setInput("");
    setLimitNotice(null);
    setIsModeMenuOpen(false);
    setIsMobileSidebarOpen(false);
    setActiveConversationId(null);
    setMessages([initialAssistantMessage]);
  }

  async function startNewSavedChat() {
    stopGeneration();
    setInput("");
    setLimitNotice(null);
    setIsModeMenuOpen(false);
    setIsMobileSidebarOpen(false);
    setMessages([initialAssistantMessage]);

    if (authStatus !== "user") {
      setActiveConversationId(null);
      return;
    }

    setIsOpeningConversation(true);

    try {
      await createConversation("");
      void loadConversations();
    } catch (error) {
      console.error("Create new saved conversation error:", error);
      setActiveConversationId(null);
    } finally {
      setIsOpeningConversation(false);
    }
  }

  function showGuestLimitNotice() {
    setLimitNotice({
      type: "guest",
      title: "საცდელი ლიმიტი ამოიწურა",
      description:
        "ანგარიშის შექმნის შემდეგ მიიღებ 15 კითხვას დღეში და მოგვიანებით შეძლებ საუბრების შენახვას.",
    });

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "assistant",
        text:
          "საცდელი ლიმიტი ამოიწურა. შექმენი ანგარიში, რომ მიიღო 15 კითხვა დღეში და გააგრძელო საუბარი.",
      },
    ]);
  }

  function showFreeLimitNotice(message?: string) {
    setLimitNotice({
      type: "free",
      title: "დღიური უფასო ლიმიტი ამოიწურა",
      description:
        message ??
        "Premium გეგმით მიიღებ მეტ კითხვას და უფრო თავისუფლად შეძლებ საუბარს.",
    });
  }

  function updateStreamingAssistantMessage(
    assistantId: number,
    requestId: number,
    nextText: string
  ) {
    if (activeRequestIdRef.current !== requestId) return;

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              text: nextText,
            }
          : message
      )
    );
  }

  async function handleErrorResponse(
    response: Response,
    assistantId: number,
    requestId: number
  ) {
    const errorText = await response.text();

    let payload: ChatErrorResponse | null = null;

    try {
      payload = JSON.parse(errorText) as ChatErrorResponse;
    } catch {
      payload = null;
    }

    if (payload?.code === "FREE_DAILY_LIMIT_REACHED") {
      const limitMessage =
        payload.message ??
        "დღიური უფასო ლიმიტი ამოიწურა. Premium გეგმით მიიღებ მეტ კითხვას.";

      showFreeLimitNotice(limitMessage);
      updateStreamingAssistantMessage(assistantId, requestId, limitMessage);

      activeRequestIdRef.current = null;
      abortControllerRef.current = null;
      clearSlowThinkingTimer();
      setTypingMessageId(null);
      setIsLoading(false);

      return;
    }

    if (
      payload?.code === "MESSAGE_TOO_LONG" ||
      payload?.code === "EMPTY_MESSAGE"
    ) {
      const readableMessage =
        payload.message ?? "შეტყობინების გაგზავნა ვერ მოხერხდა.";

      updateStreamingAssistantMessage(assistantId, requestId, readableMessage);

      activeRequestIdRef.current = null;
      abortControllerRef.current = null;
      clearSlowThinkingTimer();
      setTypingMessageId(null);
      setIsLoading(false);

      return;
    }

    throw new Error(
      payload?.error || errorText || "Failed to generate response."
    );
  }

  async function sendMessage(messageText?: string) {
    const finalMessage = (messageText ?? input).trim();

    if (!finalMessage) return;
    if (isLoading) return;
    if (authStatus === "loading") return;

    if (authStatus === "guest") {
      const currentGuestUsage = getGuestUsageCount();

      if (currentGuestUsage >= GUEST_FREE_LIMIT) {
        showGuestLimitNotice();
        return;
      }
    }

    setLimitNotice(null);
    setIsModeMenuOpen(false);

    const requestId = Date.now();
    const assistantId = requestId + 1;
    const controller = new AbortController();

    activeRequestIdRef.current = requestId;
    abortControllerRef.current = controller;

    const userMessage: Message = {
      id: requestId,
      role: "user",
      text: finalMessage,
    };

    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
    };

    const updatedMessages = [...messages, userMessage];

    setMessages([...updatedMessages, assistantMessage]);
    setInput("");
    setIsLoading(true);
    setTypingMessageId(assistantId);
    clearSlowThinkingTimer();

    const thinkingCues = getThinkingCues(finalMessage, figure.slug);

    setSlowThinkingText(thinkingCues.immediate);

    slowThinkingTimerRef.current = window.setTimeout(() => {
      if (activeRequestIdRef.current !== requestId) return;
      setSlowThinkingText(thinkingCues.delayed);
    }, 1800);

    longThinkingTimerRef.current = window.setTimeout(() => {
      if (activeRequestIdRef.current !== requestId) return;
      setSlowThinkingText(thinkingCues.longWait);
    }, 5200);

    let createdConversationIdInRequest: string | null = null;

    try {
      let conversationIdForRequest = activeConversationId;

      if (authStatus === "user" && !conversationIdForRequest) {
        conversationIdForRequest = await createConversation(finalMessage);
        createdConversationIdInRequest = conversationIdForRequest;
      } else if (
        authStatus === "user" &&
        conversationIdForRequest &&
        messages.length === 1 &&
        messages[0]?.role === "assistant"
      ) {
        void updateConversationTitleFromFirstMessage(
          conversationIdForRequest,
          finalMessage
        );
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          slug: figure.slug,
          conversationId: conversationIdForRequest,
          chatMode,
          webSearchEnabled,
          messages: updatedMessages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      if (!response.ok) {
        if (createdConversationIdInRequest) {
          try {
            await deleteConversationById(createdConversationIdInRequest, false);
          } catch (deleteError) {
            console.error("Cleanup empty conversation error:", deleteError);
          }

          setActiveConversationId(null);
        }

        await handleErrorResponse(response, assistantId, requestId);
        return;
      }

      if (!response.body) {
        throw new Error("No response stream received.");
      }

      if (authStatus === "guest") {
        const nextGuestUsage = getGuestUsageCount() + 1;
        setGuestUsageCount(nextGuestUsage);
        setGuestUsageCountState(nextGuestUsage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let streamedText = "";
      let receivedFirstChunk = false;

      while (true) {
        if (
          activeRequestIdRef.current !== requestId ||
          controller.signal.aborted
        ) {
          break;
        }

        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        if (!receivedFirstChunk && chunk.trim().length > 0) {
          receivedFirstChunk = true;
          clearSlowThinkingTimer();
        }

        streamedText += chunk;
        updateStreamingAssistantMessage(assistantId, requestId, streamedText);
      }

      reader.releaseLock();

      if (activeRequestIdRef.current === requestId) {
        if (createdConversationIdInRequest && streamedText.trim().length === 0) {
          try {
            await deleteConversationById(createdConversationIdInRequest, false);
          } catch (deleteError) {
            console.error("Cleanup empty conversation error:", deleteError);
          }

          setActiveConversationId(null);
        }

        activeRequestIdRef.current = null;
        abortControllerRef.current = null;
        clearSlowThinkingTimer();
        setTypingMessageId(null);
        setIsLoading(false);
        void loadConversations();
      }
    } catch (error) {
      const isAbortError =
        error instanceof DOMException && error.name === "AbortError";

      if (
        isAbortError ||
        activeRequestIdRef.current !== requestId ||
        controller.signal.aborted
      ) {
        clearSlowThinkingTimer();
        setTypingMessageId(null);
        setIsLoading(false);
        abortControllerRef.current = null;
        return;
      }

      console.error("Chat request error:", error);

      if (createdConversationIdInRequest) {
        try {
          await deleteConversationById(createdConversationIdInRequest, false);
        } catch (deleteError) {
          console.error("Cleanup failed conversation error:", deleteError);
        }

        setActiveConversationId(null);
      }

      updateStreamingAssistantMessage(
        assistantId,
        requestId,
        "პასუხის მიღება ვერ მოხერხდა. გადაამოწმე კავშირი და სცადე თავიდან."
      );

      clearSlowThinkingTimer();
      activeRequestIdRef.current = null;
      abortControllerRef.current = null;
      setTypingMessageId(null);
      setIsLoading(false);
    }
  }

  function handleSendClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) {
      stopGeneration();
      return;
    }

    void sendMessage();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();

      if (!isLoading) {
        void sendMessage();
      }
    }
  }

  function ThinkingIndicator({ text = "ვფიქრობ" }: { text?: string }) {
    return (
      <div className="inline-flex items-center gap-3">
        <span>{text}</span>

        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c9a45c]" />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c9a45c]"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c9a45c]"
            style={{ animationDelay: "240ms" }}
          />
        </span>
      </div>
    );
  }

  const hasUserMessage = messages.some((message) => message.role === "user");
  const shouldShowSuggestedQuestions =
    !hasUserMessage &&
    !isOpeningConversation &&
    !limitNotice &&
    suggestedQuestions.length > 0;


  function renderSidebarContent() {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            void startNewSavedChat();
          }}
          disabled={isLoading || isOpeningConversation || authStatus === "loading"}
          className="mb-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-3 text-sm font-black text-[#f4efe6] transition hover:bg-[#f4efe6]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={15} />
          ახალი საუბარი
        </button>

        <div className="mb-4 shrink-0 rounded-2xl border border-[#c9a45c]/16 bg-[#c9a45c]/8 p-3">
          <div className="flex items-center gap-3">
            <StableAssistantAvatar src={avatarImage} alt={figure.nameKa} />

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#f4efe6]">
                {figure.nameKa}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#d8c08a]">
                {figure.era}
              </p>
            </div>
          </div>
        </div>

        {authStatus === "guest" && (
          <div className="mb-4 shrink-0 rounded-2xl border border-[#f4efe6]/10 bg-[#f4efe6]/5 p-3">
            <p className="text-xs font-black text-[#f4efe6]">საცდელი რეჟიმი</p>
            <p className="mt-1.5 text-[11px] leading-4 text-[#b8aea3]">
              {guestUsageCount}/{GUEST_FREE_LIMIT} უფასო კითხვა.
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/register"
                className="rounded-full bg-[#c9a45c] px-3 py-1.5 text-[11px] font-black text-[#140d0d]"
              >
                რეგისტრაცია
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[#f4efe6]/10 px-3 py-1.5 text-[11px] font-bold text-[#f4efe6]"
              >
                შესვლა
              </Link>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1">
          <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#756b63]">
            <Clock3 size={13} />
            საუბრები
          </div>

          <div className="chat-scroll-area h-[calc(100%-24px)] space-y-1.5 overflow-y-auto pr-1">
            {authStatus === "loading" && (
              <div className="rounded-xl border border-dashed border-[#f4efe6]/10 px-3 py-3 text-[11px] leading-5 text-[#756b63]">
                იტვირთება...
              </div>
            )}

            {authStatus === "guest" && (
              <div className="rounded-xl border border-dashed border-[#f4efe6]/10 px-3 py-3 text-[11px] leading-5 text-[#756b63]">
                შესვლის შემდეგ საუბრები აქ გამოჩნდება.
              </div>
            )}

            {authStatus === "user" && isLoadingConversations && (
              <div className="rounded-xl border border-dashed border-[#f4efe6]/10 px-3 py-3 text-[11px] leading-5 text-[#756b63]">
                საუბრები იტვირთება...
              </div>
            )}

            {authStatus === "user" &&
              !isLoadingConversations &&
              savedConversations.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#f4efe6]/10 px-3 py-3 text-[11px] leading-5 text-[#756b63]">
                  ჯერ შენახული საუბარი არ გაქვს.
                </div>
              )}

            {savedConversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={`group flex w-full items-center gap-1 rounded-xl transition ${
                    isActive
                      ? "bg-[#c9a45c]/16 text-[#f4efe6] ring-1 ring-[#c9a45c]/20"
                      : "bg-[#f4efe6]/4 text-[#b8aea3] hover:bg-[#f4efe6]/7 hover:text-[#f4efe6]"
                  }`}
                >
                  <button
                    type="button"
                    title={conversation.title}
                    onClick={() => void openConversation(conversation.id)}
                    className="min-w-0 flex-1 px-3 py-2.5 text-left"
                  >
                    <span className="block truncate text-xs font-bold leading-5">
                      {conversation.title}
                    </span>

                    {conversation.chat_mode && (
                      <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.08em] text-[#756b63]">
                        {conversation.chat_mode === "living"
                          ? "ცოცხალი"
                          : "ფაქტობრივი"}
                      </span>
                    )}
                  </button>

                  <span className="hidden shrink-0 pr-1 text-[10px] text-[#756b63] group-hover:hidden xl:block">
                    {formatSavedConversationDate(conversation.updated_at)}
                  </span>

                  <button
                    type="button"
                    title="საუბრის წაშლა"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      requestDeleteConversation(conversation);
                    }}
                    className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#756b63] opacity-0 transition hover:bg-red-500/12 hover:text-red-200 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </>
    );
  }

  return (
    <section className="relative z-10 mx-auto grid h-[calc(100vh-120px)] max-w-7xl gap-5 overflow-hidden pb-0 lg:grid-cols-[250px_minmax(0,1fr)]">
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="საუბრების დახურვა"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <aside className="relative z-10 flex h-full w-[86vw] max-w-[340px] flex-col overflow-hidden border-r border-[#f4efe6]/10 bg-[#120d0d] p-3 shadow-2xl">
            <div className="mb-3 flex shrink-0 items-center justify-between rounded-2xl border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-3 py-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d8c08a]">
                საუბრები
              </p>

              <button
                type="button"
                aria-label="დახურვა"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-[#f4efe6]/10 text-[#f4efe6] transition hover:bg-[#f4efe6]/10"
              >
                <X size={15} />
              </button>
            </div>

            {renderSidebarContent()}
          </aside>
        </div>
      )}

      <aside className="hidden h-full min-h-0 flex-col overflow-hidden rounded-[1.8rem] border border-[#f4efe6]/10 bg-[#120d0d]/78 p-3 backdrop-blur-xl lg:flex">
        {renderSidebarContent()}
      </aside>

      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.8rem] border border-[#f4efe6]/10 bg-[#120d0d]/78 backdrop-blur-xl">
        <header className="shrink-0 border-b border-[#f4efe6]/8 px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 text-[#f4efe6] transition hover:bg-[#f4efe6]/10 lg:hidden"
                aria-label="საუბრები"
              >
                <Menu size={17} />
              </button>

              <StableAssistantAvatar src={avatarImage} alt={figure.nameKa} />

              <div>
                <h1 className="text-xl font-black tracking-[-0.03em] sm:text-2xl">
                  {figure.nameKa}
                </h1>
                <p className="mt-1 text-xs text-[#b8aea3]">
                  {figure.nameEn} · {figure.years}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div
  title={chatModeDescriptions[chatMode]}
  className="rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-3 py-1 text-xs font-bold text-[#b8aea3]"
>
  {chatModeShortLabels[chatMode]}
</div>

              <div className="rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-3 py-1 text-xs font-bold text-[#d8c08a]">
                {figure.era}
              </div>
            </div>
          </div>
        </header>

        <div
          ref={chatRef}
          className="chat-scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"
        >
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isTyping = typingMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <StableAssistantAvatar
                      src={avatarImage}
                      alt={figure.nameKa}
                    />
                  )}

                  <div
                    className={`max-w-[82%] min-w-0 whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-xs leading-6 [overflow-wrap:anywhere] sm:text-sm sm:leading-7 ${
                      isUser
                        ? "rounded-tr-md bg-[#c9a45c] font-bold text-[#140d0d]"
                        : "rounded-tl-md border border-[#f4efe6]/10 bg-[#f4efe6]/6 text-[#d9d0c5]"
                    }`}
                  >
                    {message.text ? (
                      message.text
                    ) : isTyping ? (
                      <ThinkingIndicator text={slowThinkingText ?? "ვფიქრობ"} />
                    ) : (
                      ""
                    )}

                    {isTyping && message.text && (
                      <span className="typing-cursor ml-1 inline-block h-4 w-[2px] translate-y-[2px] bg-[#c9a45c]" />
                    )}
                  </div>

                  {isUser && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4efe6] text-[#140d0d]">
                      <UserRound size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-[#f4efe6]/8 px-5 py-3 sm:px-7">
          <div className="mx-auto max-w-3xl">
            {limitNotice && (
              <div className="mb-4 rounded-2xl border border-[#c9a45c]/25 bg-[#c9a45c]/10 p-4">
                <p className="text-sm font-black text-[#f4efe6]">
                  {limitNotice.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#d9d0c5]">
                  {limitNotice.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {limitNotice.type === "guest" && (
                    <>
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-full bg-[#c9a45c] px-4 py-2 text-xs font-black text-[#140d0d]"
                      >
                        <UserRound size={14} />
                        რეგისტრაცია
                      </Link>

                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 px-4 py-2 text-xs font-bold text-[#f4efe6]"
                      >
                        <LogIn size={14} />
                        შესვლა
                      </Link>
                    </>
                  )}

                  <Link
                    href="/pricing"
                    className="rounded-full border border-[#c9a45c]/25 bg-[#0e0b0b] px-4 py-2 text-xs font-black text-[#d8c08a]"
                  >
                    Premium გეგმა
                  </Link>
                </div>
              </div>
            )}

            {shouldShowSuggestedQuestions && (
              <div className="mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendMessage(question)}
                    disabled={isLoading || isOpeningConversation}
                    className="truncate rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/4 px-3 py-1.5 text-left text-[10px] font-semibold leading-4 text-[#b8aea3] transition hover:border-[#c9a45c]/35 hover:bg-[#c9a45c]/10 hover:text-[#f4efe6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModeMenuOpen((value) => !value)}
                  disabled={isLoading || isOpeningConversation}
                  title={chatModeDescriptions[chatMode]}
                  className="min-h-[46px] rounded-full border border-[#f4efe6]/10 bg-[#171010] px-3 text-[10px] font-black text-[#d8c08a] transition hover:border-[#c9a45c]/35 hover:bg-[#c9a45c]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-xs"
                >
                 {chatModeShortLabels[chatMode]} ▾
                </button>

                {isModeMenuOpen && (
                  <div className="absolute bottom-full left-0 z-30 mb-2 w-72 overflow-hidden rounded-2xl border border-[#f4efe6]/10 bg-[#171010] p-1 shadow-2xl">
                    {(["factual", "living"] as ChatMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setChatMode(mode);
                          setIsModeMenuOpen(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left transition ${
                          chatMode === mode
                            ? "bg-[#c9a45c]/15 text-[#f4efe6]"
                            : "text-[#b8aea3] hover:bg-[#f4efe6]/6 hover:text-[#f4efe6]"
                        }`}
                      >
                        <span className="block text-xs font-black">
  {chatModeLabels[mode]}
</span>
<span className="mt-1 block text-[10px] leading-4 text-[#8f8378]">
  {chatModeDescriptions[mode]}
</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setWebSearchEnabled((value) => !value)}
                disabled={isLoading || isOpeningConversation}
                title="დამატებითი წყაროებით პასუხი"
                className={`hidden min-h-[46px] shrink-0 rounded-full border px-3 text-[10px] font-black transition disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex sm:items-center ${
                  webSearchEnabled
                    ? "border-[#c9a45c]/45 bg-[#c9a45c]/15 text-[#f4efe6]"
                    : "border-[#f4efe6]/10 bg-[#171010] text-[#756b63] hover:border-[#c9a45c]/35 hover:bg-[#c9a45c]/10 hover:text-[#d8c08a]"
                }`}
              >
                წყაროებით
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                rows={1}
                wrap="soft"
                placeholder={
                  isLoading
                    ? "პასუხის გაჩერება შეგიძლია..."
                    : isOpeningConversation
                      ? "საუბარი იტვირთება..."
                      : "დაწერე კითხვა..."
                }
                disabled={isOpeningConversation}
                className="chat-input-textarea min-h-[46px] max-h-[220px] min-w-0 flex-1 resize-none overflow-hidden rounded-[1.4rem] border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-3 text-xs leading-5 text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm sm:leading-6"
              />

              <button
                type="button"
                onClick={handleSendClick}
                disabled={authStatus === "loading" || isOpeningConversation}
                className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
                  isLoading
                    ? "bg-[#5c1e26] text-[#f4efe6] hover:bg-[#7a2933]"
                    : "bg-[#f4efe6] text-[#140d0d] hover:bg-[#c9a45c]"
                }`}
              >
                <span className="hidden sm:inline">
                  {isLoading ? "გაჩერება" : "გაგზავნა"}
                </span>
                {isLoading ? <Square size={16} /> : <Send size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.6rem] border border-[#f4efe6]/10 bg-[#171010] p-5 shadow-2xl">
            <p className="text-lg font-black text-[#f4efe6]">საუბრის წაშლა?</p>

            <p className="mt-3 text-sm leading-6 text-[#b8aea3]">
              ეს საუბარი და მისი შეტყობინებები წაიშლება. ამ მოქმედების დაბრუნება
              ვერ მოხერხდება.
            </p>

            <div className="mt-5 rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-3 text-sm text-[#d9d0c5]">
              <span className="line-clamp-2">{deleteTarget.title}</span>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-[#f4efe6]/10 px-4 py-3 text-sm font-bold text-[#f4efe6] transition hover:bg-[#f4efe6]/6"
              >
                გაუქმება
              </button>

              <button
                type="button"
                onClick={() => void confirmDeleteConversation()}
                className="flex-1 rounded-full bg-[#8b2635] px-4 py-3 text-sm font-black text-[#f4efe6] transition hover:bg-[#a63243]"
              >
                წაშლა
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}