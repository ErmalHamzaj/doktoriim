import * as React from "react";

export function Badge(props: React.HTMLAttributes<HTMLSpanElement>) {
  const { className = "", ...rest } = props;
  return (
    <span
      className={`inline-flex items-center rounded-2xl border px-2.5 py-1 text-xs ${className}`}
      {...rest}
    />
  );
}
