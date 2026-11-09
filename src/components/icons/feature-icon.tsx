import {
  Boxes,
  Container,
  Database,
  GitBranch,
  KeyRound,
  Layers,
  Lock,
  Network,
  ScrollText,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/domain/icon";

const registry: Record<IconName, LucideIcon> = {
  boxes: Boxes,
  network: Network,
  "shield-check": ShieldCheck,
  "scroll-text": ScrollText,
  layers: Layers,
  database: Database,
  lock: Lock,
  "git-branch": GitBranch,
  server: Server,
  container: Container,
  "key-round": KeyRound,
  users: Users,
};

interface FeatureIconProps {
  readonly name: IconName;
  readonly className?: string;
  readonly strokeWidth?: number;
}

export function FeatureIcon({ name, className, strokeWidth = 1.75 }: FeatureIconProps) {
  const Icon = registry[name];

  return <Icon aria-hidden className={className} strokeWidth={strokeWidth} />;
}
