interface SectionHeadingProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <h2 id={id} className="text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="max-w-xs text-sm leading-relaxed text-ink/70 md:text-right">{description}</p>
    </div>
  );
}
