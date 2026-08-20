"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import Spinner from "./Spinner";

type Variant = "primary" | "success" | "danger" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-teal-500 text-slate-950 hover:bg-teal-400 active:bg-teal-500 shadow-sm shadow-teal-500/20 disabled:hover:bg-teal-500",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-600 shadow-sm shadow-emerald-600/20 disabled:hover:bg-emerald-600",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-600 shadow-sm shadow-rose-600/20 disabled:hover:bg-rose-600",
  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-800 disabled:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white active:bg-slate-800",
  outline:
    "border border-slate-700 bg-transparent text-slate-200 hover:border-teal-500 hover:bg-slate-900 active:bg-slate-900",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className = "",
    children,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`
        inline-flex select-none items-center justify-center whitespace-nowrap
        font-bold transition-all duration-150
        active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size === "lg" ? "md" : "sm"} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});

export default Button;
