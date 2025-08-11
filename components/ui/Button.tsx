import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive" | "outline";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-3xl px-4 py-2 text-sm font-medium transition-all border shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    {
      primary:    "bg-teal-600 text-white border-teal-600 hover:bg-teal-500 focus:ring-teal-200",
      secondary:  "bg-sky-50 text-sky-900 border-sky-100 hover:bg-sky-100 focus:ring-sky-200",
      destructive:"bg-rose-600 text-white border-rose-600 hover:bg-rose-500 focus:ring-rose-200",
      outline:    "bg-white/70 text-slate-900 border-slate-200 hover:bg-white focus:ring-slate-200 backdrop-blur",
    }[variant] || "";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
