"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommandBlockProps = {
  command: string;
  className?: string;
};

export default function CommandBlock({ command, className }: CommandBlockProps) {
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
