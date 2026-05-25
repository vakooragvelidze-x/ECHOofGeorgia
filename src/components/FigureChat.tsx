"use client";

import type { Figure } from "@/data/figures";
import { Bot, Loader2, Send, Sparkles, Square, UserRound } from "lucide-react";
import Image from "next/image";
import {
  KeyboardEvent,
  MouseEvent,
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

type ScrollThumb = {
  top: number;
  height: number;
  visible: boolean;
};

export default function FigureChat({ figure }: { figure: Figure }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [slowThinkingText, setSlowThinkingText] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number | null>(null);
  const slowThinkingTimerRef = useRef<number | null>(null);

  const [scrollThumb, setScrollThumb] = useState<ScrollThumb>({
    top: 0,
    height: 40,
    visible: false,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text:
        figure.greeting ??
        `გამარჯობა, მე ${figure.nameKa} ვარ. მკითხე, რა გაინტერესებს.`,
    },
  ]);

  const updateScrollThumb = useCallback(() => {
    const element = chatRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isScrollable = scrollHeight > clientHeight + 8;

    if (!isScrollable) {
      setScrollThumb({
        top: 0,
        height: 40,
        visible: false,
      });
      return;
    }

    const trackHeight = clientHeight - 32;
    const thumbHeight = Math.max(38, (clientHeight / scrollHeight) * trackHeight);
    const maxThumbTop = trackHeight - thumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const thumbTop =
      maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setScrollThumb({
      top: thumbTop,
      height: thumbHeight,
      visible: true,
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const element = chatRef.current;
      if (!element) return;

      element.scrollTop = element.scrollHeight;
      updateScrollThumb();
    });
  }, [updateScrollThumb]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingMessageId, scrollToBottom]);

  useEffect(() => {
    updateScrollThumb();
    window.addEventListener("resize", updateScrollThumb);

    return () => {
      window.removeEventListener("resize", updateScrollThumb);
      stopGeneration();
    };
  }, [updateScrollThumb]);
  
  function clearSlowThinkingTimer() {
  if (slowThinkingTimerRef.current) {
    window.clearTimeout(slowThinkingTimerRef.current);
    slowThinkingTimerRef.current = null;
  }

  setSlowThinkingText(null);
}

  function stopGeneration() {
    clearSlowThinkingTimer();
    activeRequestIdRef.current = null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setTypingMessageId(null);
    setIsLoading(false);
  }

  function animateAssistantResponse(fullText: string, requestId: number) {
    clearSlowThinkingTimer();
    const assistantId = Date.now() + 1;
    let index = 0;

    const typingStep = fullText.length > 420 ? 3 : fullText.length > 220 ? 2 : 1;
    const typingSpeed = 30;

    setMessages((current) => [
      ...current,
      {
        id: assistantId,
        role: "assistant",
        text: "",
      },
    ]);

    setTypingMessageId(assistantId);

    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = window.setInterval(() => {
      if (activeRequestIdRef.current !== requestId) {
        if (typingIntervalRef.current) {
          window.clearInterval(typingIntervalRef.current);
        }

        typingIntervalRef.current = null;
        setTypingMessageId(null);
        setIsLoading(false);
        return;
      }

      index += typingStep;

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                text: fullText.slice(0, index),
              }
            : message
        )
      );

      if (index >= fullText.length) {
        if (typingIntervalRef.current) {
          window.clearInterval(typingIntervalRef.current);
        }

        typingIntervalRef.current = null;
        abortControllerRef.current = null;
        activeRequestIdRef.current = null;
        setTypingMessageId(null);
        setIsLoading(false);
      }
    }, typingSpeed);
  }

  async function sendMessage(messageText?: string) {
    const finalMessage = (messageText ?? input).trim();

    if (!finalMessage) return;
    if (isLoading) return;

    const requestId = Date.now();
    const controller = new AbortController();

    activeRequestIdRef.current = requestId;
    abortControllerRef.current = controller;

    const userMessage: Message = {
      id: requestId,
      role: "user",
      text: finalMessage,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setTypingMessageId(null);
clearSlowThinkingTimer();

slowThinkingTimerRef.current = window.setTimeout(() => {
  if (activeRequestIdRef.current === requestId) {
    setSlowThinkingText(
      figure.slug === "vazha-pshavela"
        ? "ეს კითხვა ღრმაა... ცოტა დრო დამჭირდება, რომ კარგად დავფიქრდე."
        : "ეს საინტერესო კითხვაა... ცოტა დრო დამჭირდება, რომ სწორად გიპასუხო."
    );
  }
}, 8000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          slug: figure.slug,
          messages: updatedMessages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      if (activeRequestIdRef.current !== requestId || controller.signal.aborted) {
        return;
      }

      const rawText = await response.text();

      if (activeRequestIdRef.current !== requestId || controller.signal.aborted) {
        return;
      }

      let data: { text?: string; error?: string };

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned non-JSON response. First part: ${rawText.slice(0, 140)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response.");
      }

      if (activeRequestIdRef.current === requestId && !controller.signal.aborted) {
        animateAssistantResponse(
          data.text || "პასუხი ვერ მივიღე. სცადე თავიდან.",
          requestId
        );
      }
    } catch (error) {
      const isAbortError =
        error instanceof DOMException && error.name === "AbortError";

      if (
        isAbortError ||
        activeRequestIdRef.current !== requestId ||
        controller.signal.aborted
      ) {
        setIsLoading(false);
        setTypingMessageId(null);
        abortControllerRef.current = null;
        return;
      }

      console.error("Chat request error:", error);

      animateAssistantResponse(
        "პასუხის მიღება ვერ მოხერხდა. გადაამოწმე API key, მოდელის სახელი და სცადე თავიდან.",
        requestId
      );
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

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      if (!isLoading) {
        void sendMessage();
      }
    }
  }

  function AssistantAvatar() {
    const avatarImage = figure.iconImage ?? figure.image;

    if (avatarImage) {
      return (
        <div className="relative mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#c9a45c]/30 bg-[#171010]">
          <Image
            src={avatarImage}
            alt={figure.nameKa}
            fill
            sizes="36px"
            className="object-cover grayscale sepia-[0.22] contrast-110"
          />
        </div>
      );
    }

    return (
      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 text-[#c9a45c]">
        <Bot size={17} />
      </div>
    );
  }

  return (
    <section className="relative z-10 mx-auto grid max-w-7xl gap-6 pb-24 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7">
        <div className="mb-5 flex items-center gap-3">
          <Sparkles className="text-[#c9a45c]" size={22} />
          <h2 className="text-2xl font-black">კითხვები</h2>
        </div>

        <div className="space-y-3">
          {figure.questions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              disabled={isLoading}
              className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-4 text-left text-sm leading-6 text-[#d9d0c5] transition hover:border-[#c9a45c]/35 hover:bg-[#c9a45c]/10 hover:text-[#f4efe6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-4 sm:p-7">
        <div className="mb-5">
          <h2 className="text-3xl font-black">საუბარი</h2>
        </div>

        <div className="relative">
          <div
            ref={chatRef}
            onScroll={updateScrollThumb}
            className="chat-scroll-area h-[520px] overflow-y-auto rounded-[1.5rem] border border-[#f4efe6]/10 bg-[#0e0b0b] p-4 pr-8"
          >
            <div className="space-y-4">
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
                    {!isUser && <AssistantAvatar />}

                    <div
                      className={`max-w-[86%] whitespace-pre-line rounded-3xl p-5 text-sm leading-7 ${
                        isUser
                          ? "rounded-tr-md bg-[#c9a45c] font-semibold text-[#140d0d]"
                          : "rounded-tl-md border border-[#f4efe6]/10 bg-[#f4efe6]/6 text-[#d9d0c5]"
                      }`}
                    >
                      {message.text}
                      {isTyping && (
                        <span className="typing-cursor ml-1 inline-block h-4 w-[2px] translate-y-[2px] bg-[#c9a45c]" />
                      )}
                    </div>

                    {isUser && (
                      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4efe6] text-[#140d0d]">
                        <UserRound size={17} />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && !typingMessageId && (
                <div className="flex justify-start gap-3">
                  <AssistantAvatar />

                  <div className="inline-flex items-center gap-3 rounded-3xl rounded-tl-md border border-[#f4efe6]/10 bg-[#f4efe6]/6 p-5 text-sm leading-7 text-[#d9d0c5]">
  <Loader2 className="shrink-0 animate-spin text-[#c9a45c]" size={17} />
  {slowThinkingText ?? "ფიქრობს..."}
</div>
                </div>
              )}
            </div>
          </div>

          {scrollThumb.visible && (
            <div className="pointer-events-none absolute bottom-4 right-3 top-4 w-1 rounded-full bg-[#f4efe6]/5">
              <div
                className="w-full rounded-full bg-[#c9a45c]/60 shadow-[0_0_16px_rgba(201,164,92,0.35)]"
                style={{
                  height: `${scrollThumb.height}px`,
                  transform: `translateY(${scrollThumb.top}px)`,
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={
              isLoading ? "პასუხის გაჩერება შეგიძლია..." : "დაწერე კითხვა..."
            }
            className="min-w-0 flex-1 rounded-full border border-[#f4efe6]/10 bg-[#0e0b0b] px-5 py-4 text-sm text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
          />

          <button
            type="button"
            onClick={handleSendClick}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-bold transition ${
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
    </section>
  );
}