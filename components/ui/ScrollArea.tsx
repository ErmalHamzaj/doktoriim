import * as React from "react";
export function ScrollArea({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={"overflow-y-auto " + (className || "")}>{children}</div>;
}
