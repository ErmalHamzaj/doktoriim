import * as React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_6px_30px_-12px_rgba(13,148,136,0.25)] ${className}`}
      {...rest}
    />
  );
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div
      className={`p-5 border-b border-white/70 bg-white/60 rounded-t-3xl ${className}`}
      {...rest}
    />
  );
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className = "", ...rest } = props;
  return <h3 className={`text-lg font-semibold tracking-tight ${className}`} {...rest} />;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`p-5 ${className}`} {...rest} />;
}
