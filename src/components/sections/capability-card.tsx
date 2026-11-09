import type { Capability } from "@/domain/capability";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { capabilityVisuals } from "@/components/sections/capability-visuals";
import { AppLink } from "@/components/ui/app-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const docAnchors: Record<string, string> = {
  catalog: "/docs#catalog-management",
  access: "/docs#rbac-governance",
  audit: "/docs#audit-trail",
};

export function CapabilityCard({ capability }: { readonly capability: Capability }) {
  const Visual = capabilityVisuals[capability.visual];
  const { highlighted } = capability;
  const docLink = docAnchors[capability.id] ?? "/docs";

  return (
    <Card className={cn("flex flex-col gap-4 p-6 border-zinc-200/90 shadow-2xs", highlighted && "bg-brand text-white border-brand shadow-xs")}>
      <CardHeader>
        <CardTitle>{capability.title}</CardTitle>
        <AppLink href={docLink} aria-label={`Read documentation for ${capability.title}`}>
          <ArrowBadge tone={highlighted ? "lime" : "brand"} />
        </AppLink>
      </CardHeader>
      <Separator className={highlighted ? "bg-white/60" : undefined} />
      <CardContent className="flex-1">
        <CardDescription className={highlighted ? "text-white/90" : "text-ink/70"}>
          {capability.summary}
        </CardDescription>
        <div className={cn("mt-auto rounded-2xl p-4", highlighted ? "bg-lime" : "bg-brand")}>
          <Visual />
        </div>
      </CardContent>
    </Card>
  );
}
