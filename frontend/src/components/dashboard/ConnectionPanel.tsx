import type { ConnectionInfo, ConnectionMode } from "../../types/printer";
import { StatusBadge, translateTone } from "./StatusBadge";

interface ConnectionPanelProps {
  mode: ConnectionMode;
  connection: ConnectionInfo | null;
  loadState: "idle" | "loading" | "ready" | "error";
  language: "tr" | "en";
  onConnect: () => void;
  onModeChange: (mode: ConnectionMode) => void;
}

export function ConnectionPanel({
  mode,
  connection,
  loadState,
  language,
  onConnect,
  onModeChange,
}: ConnectionPanelProps) {
  const hasReconnectInfo = Boolean(connection?.nextReconnectAt);
  const statusTone = connection?.state ?? loadState;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>
          <span className="step-badge">1</span>
          {language === "tr" ? "Bağlantı Ayarları" : "Connection Settings"}
        </h2>
        <StatusBadge tone={statusTone} label={translateTone(statusTone, language)} />
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
          {language === "tr" ? "Bağlan" : "Connect"}
        </button>
      </div>

      {hasReconnectInfo ? (
        <div className="reconnect-note">
          <strong>{language === "tr" ? "Yeniden bağlantı planlandı" : "Reconnect scheduled"}</strong>
          <span>{formatDateTime(connection?.nextReconnectAt)}</span>
        </div>
      ) : null}

      <dl className="facts">
        <div>
          <dt>{language === "tr" ? "Aktif mod" : "Active mode"}</dt>
          <dd>{connection?.mode?.toUpperCase() ?? "-"}</dd>
        </div>
        <div>
          <dt>{language === "tr" ? "Deneme sayısı" : "Attempts"}</dt>
          <dd>{connection?.reconnectAttempts ?? 0}</dd>
        </div>
        <div>
          <dt>{language === "tr" ? "Son bağlantı" : "Last connected"}</dt>
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
