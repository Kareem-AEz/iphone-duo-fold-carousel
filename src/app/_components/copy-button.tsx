"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";

type CopyState = "idle" | "copied" | "failed";

const ICONS = { idle: CopyIcon, copied: CheckIcon, failed: XIcon };

/** What the live region announces for each state. */
const ANNOUNCEMENTS: Record<CopyState, string> = {
  idle: "",
  copied: "Copied",
  failed: "Copy failed",
};

/** How long the confirmation shows before the button resets. */
const RESET_MS = 1500;

/** Copies `text` to the clipboard, then confirms with a check, or a cross if the clipboard refuses. */
export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (state === "idle") return;

    const timeout = setTimeout(() => setState("idle"), RESET_MS);
    return () => clearTimeout(timeout);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  const Icon = ICONS[state];

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Copy code"
        onClick={copy}
        className="text-muted-foreground hover:text-foreground relative after:absolute after:-inset-2"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", bounce: 0, duration: 0.25 }
            }
            className="grid place-items-center"
          >
            <Icon />
          </motion.span>
        </AnimatePresence>
      </Button>
      <span aria-live="polite" className="sr-only">
        {ANNOUNCEMENTS[state]}
      </span>
    </>
  );
}
