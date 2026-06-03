import type { ConnectionInfo, ConnectionMode } from "../../types/printer";
import { StatusBadge, type BadgeTone } from "./StatusBadge";

interface ConnectionPanelProps {
  mode: ConnectionMode;
  connection: ConnectionInfo | null;
  loadState: Extract<BadgeTone, "idle" | "loading" | "ready" | "error">;
  onConnect: () => void;
  onModeChange: (mode: ConnectionMode) => void;
}

export function ConnectionPanel({
  mode,
  connection,
  loadState,
  onConnect,
  onModeChange,
}: ConnectionPanelProps) {
  const hasReconnectInfo = Boolean(connection?.nextReconnectAt);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Connection</h2>
        <StatusBadge label={connection?.state ?? loadState} />
      </div>

      <div className="connection-controls">
        <div className="segmented">
          <button className={mode === "usb" ? "active" : ""} type="button" onClick={() => onModeChange("usb")}>
            USB
          </button>
          <button className={mode === "lan" ? "active" : ""} type="button" onClick={() => onModeChange("lan")}>
            LAN
          </button>
        </div>
        <button className="primary-button connect-btn" type="button" onClick={onConnect}>
          Connect
        </button>
      </div>

      {hasReconnectInfo ? (
        <div className="reconnect-note">
          <strong>Reconnect scheduled</strong>
          <span>{formatDateTime(connection?.nextReconnectAt)}</span>
        </div>
      ) : null}

      <dl className="facts">
        <div>
          <dt>Active mode</dt>
          <dd>{connection?.mode?.toUpperCase() ?? "-"}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{connection?.reconnectAttempts ?? 0}</dd>
        </div>
        <div>
          <dt>Last connected</dt>
          <dd>{formatDateTime(connection?.lastConnectedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
