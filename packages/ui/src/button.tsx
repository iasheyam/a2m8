import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "primary" | "destructive";
type ButtonSize = "default" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: "bg-card border border-line text-ink hover:border-ink-3",
  primary: "bg-pine border border-pine text-white hover:bg-pine-2 hover:border-pine-2",
  destructive: "bg-transparent border border-red/30 text-red hover:bg-red-soft",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "px-3.5 py-2 text-[13px]",
  sm: "px-2.5 py-[5px] text-xs",
};

export function Button({ variant = "default", size = "default", className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-sm font-medium leading-none transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
