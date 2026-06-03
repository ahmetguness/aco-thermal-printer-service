import type { PrinterStatus } from "../../types/printer";
import { StatusBadge } from "./StatusBadge";

interface StatusPanelProps {
  status: PrinterStatus | null;
}

export function StatusPanel({ status }: StatusPanelProps) {
  const health = status?.health ?? null;
  const lastJob = status?.lastJob ?? null;

  function renderHealthIndicator(value: string | undefined, okVal: string, warnVal?: string) {
    if (!value) return "-";
    
    let dotClass = "health-dot";
    let textClass = "health-text";
    
    if (value === okVal) {
      dotClass += " dot-success";
      textClass += " text-success";
    } else if (warnVal && value === warnVal) {
      dotClass += " dot-warning";
      textClass += " text-warning";
    } else {
      dotClass += " dot-danger";
      textClass += " text-danger";
    }
    
    return (
      <div className="health-row">
        <span className={dotClass}></span>
        <span className={textClass}>{value.toUpperCase()}</span>
      </div>
    );
  }

  const rollPercentage = status?.predictions?.remainingRollPercentage ?? 100;
  let progressClass = "progress-fill-success";
  if (rollPercentage < 15) {
    progressClass = "progress-fill-danger";
  } else if (rollPercentage < 40) {
    progressClass = "progress-fill-warning";
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Status</h2>
        {lastJob ? <StatusBadge label={lastJob.status} /> : null}
      </div>
      <div className="status-stack">
        <div className="status-section">
          <h3>Hardware</h3>
          <dl className="facts-vertical">
            <div>
              <dt>Paper</dt>
              <dd>{renderHealthIndicator(health?.paper, "ok", "near_end")}</dd>
            </div>
            <div>
              <dt>Cover</dt>
              <dd>{renderHealthIndicator(health?.cover, "closed")}</dd>
            </div>
            <div>
              <dt>Temperature</dt>
              <dd>{renderHealthIndicator(health?.temperature, "normal")}</dd>
            </div>
          </dl>
        </div>

        <div className="status-section">
          <h3>Last job</h3>
          <dl className="facts-vertical">
            <div>
              <dt>Type</dt>
              <dd>{lastJob?.type ?? "-"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{lastJob ? renderHealthIndicator(lastJob.status, "success", "queued") : "-"}</dd>
            </div>
            <div>
              <dt>Error</dt>
              <dd>
                {lastJob?.error?.code ? (
                  <span className="error-text-highlight">{lastJob.error.code}</span>
                ) : (
                  "-"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="status-section">
          <h3>Predictions (Bonus)</h3>
          <dl className="facts-vertical">
            <div>
              <dt>Roll Remaining</dt>
              <dd>{status?.predictions ? `${status.predictions.remainingRollPercentage}%` : "-"}</dd>
            </div>
            <div>
              <dt>Roll Length</dt>
              <dd>{status?.predictions ? `${status.predictions.remainingRollMeters}m` : "-"}</dd>
            </div>
            <div>
              <dt>Queue ETA</dt>
              <dd className="text-info">{status?.predictions ? `${status.predictions.printEtaSeconds}s` : "-"}</dd>
            </div>
          </dl>
          {status?.predictions && (
            <div className="progress-track" style={{ marginTop: "12px", width: "100%" }}>
              <div className={`progress-fill ${progressClass}`} style={{ width: `${rollPercentage}%` }}></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
