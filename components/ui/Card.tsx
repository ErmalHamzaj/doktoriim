import * as React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`} {...rest} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`p-4 border-b bg-white/60 rounded-t-2xl ${className}`} {...rest} />;
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className = "", ...rest } = props;
  return <h3 className={`text-lg font-semibold ${className}`} {...rest} />;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`p-4 ${className}`} {...rest} />;
}
