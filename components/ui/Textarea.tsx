import * as React from "react";
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full min-h-[96px] rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" {...props} />;
}
