import type { LogEntry } from "../../types/printer";

interface LogsPanelProps {
  exportUrl: string;
  logs: LogEntry[];
}

export function LogsPanel({ exportUrl, logs }: LogsPanelProps) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Logs</h2>
        <a className="link-button" href={exportUrl}>
          Export CSV
        </a>
      </div>
      <div className="log-list">
        {logs.length === 0 ? (
          <div className="empty-state">No logs yet</div>
        ) : (
          logs.map((log) => (
            <LogRow log={log} key={`${log.ts}-${log.op}-${log.jobId ?? "system"}`} />
          ))
        )}
      </div>
    </section>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const isError = log.status === "error" || Boolean(log.error);
  const rowClassName = isError ? "log-row log-row-error" : "log-row";

  return (
    <div className={rowClassName}>
      <span>{formatLogTime(log.ts)}</span>
      <strong>{log.op}</strong>
      <span className={isError ? "log-pill log-pill-error" : "log-pill"}>{log.status}</span>
      <span>{log.error?.code ?? log.message ?? "-"}</span>
    </div>
  );
}

function formatLogTime(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
