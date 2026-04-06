"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackCommandCopied } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type CommandBlockProps = {
  command: string;
  commandId: string;
  className?: string;
};

function readCurrentExp() {
  return new URLSearchParams(window.location.search).get("exp") ?? "";
}

export default function CommandBlock({ command, commandId, className }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      const exp = readCurrentExp();
      trackCommandCopied({
        command_id: commandId,
        page_path: window.location.pathname,
        exp,
        has_exp: Boolean(exp),
      });
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("rounded-lg border border-border bg-secondary/35", className)}>
      <div className="flex justify-end border-b border-border px-2 py-1.5">
        <Button type="button" size="xs" variant="outline" onClick={handleCopy}>
          {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-xs text-foreground">
        <code>{command}</code>
      </pre>
    </div>
  );
}
