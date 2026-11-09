import { ArrowBadge } from "@/components/brand/arrow-badge";
import { PageFrame } from "@/components/layout/page-frame";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFoundPage() {
  return (
    <PageFrame>
      <main className="flex flex-col items-center gap-6 py-32 text-center">
        <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">Page not found</h1>
        <p className="max-w-md text-ink/70">The page you are looking for does not exist or has moved.</p>
        <ButtonLink href="/" size="lg">
          <ArrowBadge direction="up-left" />
          Back Home
        </ButtonLink>
      </main>
    </PageFrame>
  );
}
