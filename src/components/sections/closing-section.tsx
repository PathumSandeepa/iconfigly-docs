import { site } from "@/content/site";
import { AsteriskDecoration, SparkleDecoration } from "@/components/brand/decorations";
import { Badge } from "@/components/ui/badge";

export function ClosingSection() {
  return (
    <section className="relative mt-16 flex flex-col items-center gap-6 px-4 pb-4 pt-8 text-center">
      <SparkleDecoration className="absolute bottom-0 left-0 hidden md:block lg:left-12" />
      <AsteriskDecoration className="absolute bottom-0 right-0 hidden md:block lg:right-12" />
      <p className="text-3xl font-semibold leading-snug tracking-tight text-ink md:text-4xl">
        Keep <Badge variant="highlight" className="px-5 py-0.5 text-3xl md:text-4xl">shipping</Badge> until you
        <br />
        own your <span className="text-brand">platform.</span>
      </p>
      <p className="text-sm text-ink/70">
        {site.author.name}
        <br />
        {site.author.role}
      </p>
    </section>
  );
}
