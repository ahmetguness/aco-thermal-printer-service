import type { PrintJob, QueueSummary } from "../../types/printer";

interface QueuePanelProps {
  lastFailedJob: PrintJob | null;
  lastJob: PrintJob | null;
  queue: QueueSummary | null;
  language: "tr" | "en";
  onReprint: () => void;
  variant?: "panel" | "embedded";
}

export function QueuePanel({ lastFailedJob, lastJob, queue, language, onReprint, variant = "panel" }: QueuePanelProps) {
  const reprintHint = getReprintHint(lastFailedJob, lastJob, language);
  const content = (
    <>
      <div className="panel-header queue-panel-header">
        <h2>{language === "tr" ? "Baskı Kuyruğu" : "Print Queue"}</h2>
      </div>
      <div className="queue-panel-body">
        <dl className="facts compact queue-facts">
          <div>
            <dt>{language === "tr" ? "Toplam" : "Total"}</dt>
            <dd>{queue?.total ?? 0}</dd>
          </div>
          <div>
            <dt>{language === "tr" ? "Başarılı" : "Success"}</dt>
            <dd>{queue?.success ?? 0}</dd>
          </div>
          <div>
            <dt>{language === "tr" ? "Başarısız" : "Failed"}</dt>
            <dd>{queue?.failed ?? 0}</dd>
          </div>
        </dl>
        <div className="queue-reprint-area">
          <button className="reprint-btn" type="button" disabled={!lastFailedJob} onClick={onReprint}>
            {language === "tr" ? "Tekrar Bastır" : "Reprint Failed"}
          </button>
          <p className="hint">{reprintHint}</p>
        </div>
      </div>
    </>
  );

  if (variant === "embedded") {
    return <div className="queue-panel-embedded">{content}</div>;
  }

  return (
    <section className="panel">
      {content}
    </section>
  );
}

function getReprintHint(lastFailedJob: PrintJob | null, lastJob: PrintJob | null, language: "tr" | "en"): string {
  if (lastFailedJob) {
    return language === "tr" ? `Hata Alan İş: ${lastFailedJob.id}` : `Active Failed Job: ${lastFailedJob.id}`;
  }

  if (lastJob?.status === "success") {
    return language === "tr"
      ? "Son iş başarılı olduğu için tekrar bastırma pasif."
      : "Reprint disabled because last print succeeded.";
  }

  return language === "tr"
    ? "Başarısız iş oluştuğunda tekrar bastırma aktif olur."
    : "Reprint becomes active when a print job fails.";
}
