import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("px-5 py-20 md:py-28", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="font-display text-3xl uppercase tracking-[0.06em] text-foreground md:text-5xl">
        {title}
      </Heading>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
