import * as React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
};

export function Button({ className, variant = "default", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors border";
  const styles = {
    default: "bg-slate-900 text-white border-slate-900 hover:opacity-90",
    secondary: "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200",
    destructive: "bg-red-600 text-white border-red-600 hover:bg-red-700",
    outline: "bg-transparent text-slate-900 border-slate-300 hover:bg-slate-50",
  }[variant];
  return <button className={clsx(base, styles, className)} {...props} />;
}
