import type { ConnectionState, PrintJobStatus } from "../../types/printer";

export type BadgeTone = ConnectionState | PrintJobStatus | "idle" | "loading" | "ready" | "error" | "ok";

interface StatusBadgeProps {
  label: BadgeTone;
}

export function StatusBadge({ label }: StatusBadgeProps) {
  return <span className={`status-badge status-${label}`}>{label}</span>;
}
