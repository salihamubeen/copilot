"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpIcon, MicIcon, SquareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Composer({
  onSend,
  onStop,
  streaming,
  disabled,
  placeholder = `Message ${APP_CONFIG.appName}…`,
  autoFocus,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    if (autoFocus && window.matchMedia("(min-width: 768px)").matches) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        setValue((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (streaming) return onStop();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const touch = window.matchMedia("(hover: none)").matches;
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !touch) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = streaming || (!!value.trim() && !disabled);

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-3xl rounded-3xl border bg-card p-2.5 pl-4 shadow-sm transition-colors focus-within:border-ring"
    >
      <label htmlFor="composer" className="sr-only">
        Message
      </label>
      <textarea
        id="composer"
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        enterKeyHint="send"
        className="field-sizing-content max-h-52 min-h-7 w-full resize-none bg-transparent py-1.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
      />
      <div className="mt-1 flex items-center justify-end gap-2">
        {mounted && recognitionRef.current && (
          <Button
            type="button"
            size="icon"
            onClick={toggleRecording}
            aria-label={isRecording ? "Stop recording" : "Start speech-to-text"}
            className={cn(
              "rounded-full transition-colors",
              isRecording ? "bg-red-500 text-white animate-pulse" : "opacity-70 hover:opacity-100"
            )}
          >
            <MicIcon className="size-3.5" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={streaming ? "Stop generating" : "Send message"}
          className={cn("rounded-full", !canSend && "opacity-30")}
        >
          {streaming ? <SquareIcon className="size-3.5 fill-current" /> : <ArrowUpIcon />}
        </Button>
      </div>
    </form>
  );
}
