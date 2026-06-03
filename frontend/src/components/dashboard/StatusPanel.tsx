import type { PrinterStatus } from "../../types/printer";
import { StatusBadge } from "./StatusBadge";

interface StatusPanelProps {
  status: PrinterStatus | null;
}

export function StatusPanel({ status }: StatusPanelProps) {
  const health = status?.health ?? null;
  const lastJob = status?.lastJob ?? null;
  const queue = status?.queue ?? null;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Status</h2>
        {lastJob ? <StatusBadge label={lastJob.status} /> : null}
      </div>
      <div className="status-stack">
        <dl className="facts">
          <div>
            <dt>Paper</dt>
            <dd>{health?.paper ?? "-"}</dd>
          </div>
          <div>
            <dt>Cover</dt>
            <dd>{health?.cover ?? "-"}</dd>
          </div>
          <div>
            <dt>Temperature</dt>
            <dd>{health?.temperature ?? "-"}</dd>
          </div>
        </dl>

        <div className="status-section">
          <h3>Last job</h3>
          <dl className="facts">
            <div>
              <dt>Type</dt>
              <dd>{lastJob?.type ?? "-"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{lastJob?.status ?? "-"}</dd>
            </div>
            <div>
              <dt>Error</dt>
              <dd>{lastJob?.error?.code ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="status-section">
          <h3>Queue summary</h3>
          <dl className="facts compact">
            <div>
              <dt>Total</dt>
              <dd>{queue?.total ?? 0}</dd>
            </div>
            <div>
              <dt>Success</dt>
              <dd>{queue?.success ?? 0}</dd>
            </div>
            <div>
              <dt>Failed</dt>
              <dd>{queue?.failed ?? 0}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
