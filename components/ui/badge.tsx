import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type BadgeProps = {
  tone?: "live" | "ht" | "upcoming" | "finished" | "neutral";
  children: ReactNode;
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={cn("badge", tone !== "neutral" ? `badge-${tone}` : undefined)}>{children}</span>;
}
