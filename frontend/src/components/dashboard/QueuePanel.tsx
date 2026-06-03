import type { PrintJob, QueueSummary } from "../../types/printer";

interface QueuePanelProps {
  lastFailedJob: PrintJob | null;
  lastJob: PrintJob | null;
  queue: QueueSummary | null;
  onReprint: () => void;
}

export function QueuePanel({ lastFailedJob, lastJob, queue, onReprint }: QueuePanelProps) {
  const reprintHint = getReprintHint(lastFailedJob, lastJob);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Queue</h2>
      </div>
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
      <button type="button" disabled={!lastFailedJob} onClick={onReprint}>
        Tekrar Bastır
      </button>
      <p className="hint">{reprintHint}</p>
    </section>
  );
}

function getReprintHint(lastFailedJob: PrintJob | null, lastJob: PrintJob | null): string {
  if (lastFailedJob) {
    return `Aktif: ${lastFailedJob.id}`;
  }

  if (lastJob?.status === "success") {
    return "Son iş başarılı olduğu için tekrar bastırma pasif.";
  }

  return "Başarısız iş oluştuğunda buton aktif olur.";
}
