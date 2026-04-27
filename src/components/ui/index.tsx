"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-syne";

    const variants = {
      primary: "bg-accent text-white hover:bg-[#5a52e0] active:scale-[0.98]",
      ghost:
        "bg-surface3 text-muted border border-white/10 hover:text-white hover:border-white/20 active:scale-[0.98]",
      danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    };

    const sizes = {
      sm: "text-xs px-3 py-2",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-current animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Card
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = "", onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-white/7 rounded-2xl p-5 ${
        hover ? "cursor-pointer hover:border-white/15 hover:-translate-y-0.5 transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`bg-surface2 border border-white/12 rounded-xl text-white font-syne text-sm px-3 py-2.5 outline-none transition-colors focus:border-accent placeholder:text-muted2 ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`bg-surface2 border border-white/12 rounded-xl text-white font-syne text-sm px-3 py-2.5 outline-none transition-colors focus:border-accent ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface2">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`bg-surface2 border border-white/12 rounded-xl text-white font-syne text-sm px-3 py-2.5 outline-none transition-colors focus:border-accent placeholder:text-muted2 resize-y min-h-[80px] ${className}`}
        {...props}
      />
    </div>
  );
}

// Loader
export function Loader({ size = 20 }: { size?: number }) {
  return (
    <div
      className="border-2 border-white/10 border-t-accent2 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

// Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "red" | "blue" | "purple";
}

const badgeStyles = {
  default: "bg-surface3 text-muted border-white/10",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyles[variant]}`}
    >
      {children}
    </span>
  );
}
