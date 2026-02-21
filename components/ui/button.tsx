import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "muted";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn("btn", variant === "primary" ? "btn-primary" : "btn-muted", className)} {...props} />;
}
