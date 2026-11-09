import type { ComponentType } from "react";
import { CircleCheck, Link2 } from "lucide-react";
import type { CapabilityVisual } from "@/domain/capability";
import type { AccessLevel } from "@/domain/sample";
import {
  accessColumns,
  accessRows,
  auditChain,
  environmentTiers,
  sampleResources,
} from "@/content/samples";
import { FeatureIcon } from "@/components/icons/feature-icon";
import { cn } from "@/lib/utils";

const chipClassName = "rounded-xl bg-white text-xs font-medium text-ink";

const levelDot: Record<AccessLevel, string> = {
  write: "bg-brand",
  read: "bg-ink/50",
  none: "bg-ink/15",
};

const levelLabel: Record<AccessLevel, string> = {
  write: "Write",
  read: "Read",
  none: "None",
};

function CatalogVisualContent() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-1.5">
        {environmentTiers.map((tier) => (
          <span key={tier} className={cn(chipClassName, "py-1.5 text-center font-semibold text-brand")}>
            {tier}
          </span>
        ))}
      </div>
      {sampleResources.map((resource) => (
        <div key={resource.name} className={cn(chipClassName, "flex items-center justify-between gap-2 px-3 py-2")}>
          <span className="flex min-w-0 items-center gap-2">
            <FeatureIcon name={resource.icon} className="size-4 shrink-0 text-brand" />
            <span className="truncate">{resource.name}</span>
          </span>
          <span className="text-[10px] font-semibold text-brand">{resource.kind}</span>
        </div>
      ))}
    </div>
  );
}

function AccessVisualContent() {
  return (
    <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5">
      <span aria-hidden />
      {accessColumns.map((column) => (
        <span key={column} className={cn(chipClassName, "py-1.5 text-center font-semibold text-brand")}>
          {column}
        </span>
      ))}
      {accessRows.map((row) => (
        <div key={row.team} className="contents">
          <span className={cn(chipClassName, "flex items-center whitespace-nowrap px-2.5 py-2 font-semibold")}>
            {row.team}
          </span>
          {row.levels.map((level, index) => (
            <span
              key={accessColumns[index]}
              className={cn(chipClassName, "flex items-center justify-center gap-1 px-1 py-2 text-[11px]")}
            >
              <span className={cn("size-1.5 rounded-full", levelDot[level])} />
              {levelLabel[level]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function AuditVisualContent() {
  return (
    <div className="flex flex-col items-stretch gap-1.5">
      {auditChain.map((entry, index) => (
        <div key={entry.hash} className="flex flex-col items-center gap-1.5">
          <div className={cn(chipClassName, "flex w-full items-center justify-between gap-2 px-3 py-2")}>
            <span>{entry.action}</span>
            <span className="font-mono text-ink/50">{entry.hash}…</span>
          </div>
          {index < auditChain.length - 1 && <Link2 aria-hidden className="size-4 text-white" />}
        </div>
      ))}
      <span className={cn(chipClassName, "mt-1 flex items-center justify-center gap-1.5 py-2 font-semibold text-brand")}>
        <CircleCheck aria-hidden className="size-4" />
        Chain verified
      </span>
    </div>
  );
}

export const capabilityVisuals: Record<CapabilityVisual, ComponentType> = {
  catalog: CatalogVisualContent,
  access: AccessVisualContent,
  audit: AuditVisualContent,
};
