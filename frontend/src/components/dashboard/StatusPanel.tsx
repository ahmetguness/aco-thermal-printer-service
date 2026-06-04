import type { PrinterStatus } from "../../types/printer";
import { StatusBadge, translateTone, type BadgeTone } from "./StatusBadge";

interface StatusPanelProps {
  status: PrinterStatus | null;
  language: "tr" | "en";
}

export function StatusPanel({ status, language }: StatusPanelProps) {
  const health = status?.health ?? null;
  const lastJob = status?.lastJob ?? null;

  function renderHealthIndicator(field: "paper" | "cover" | "temp" | "job", value: string | undefined) {
    if (!value) return "-";
    
    let dotClass = "health-dot";
    let textClass = "health-text";
    let displayLabel = value.toUpperCase();
    
    if (field === "paper") {
      if (value === "ok") {
        dotClass += " dot-success";
        textClass += " text-success";
        displayLabel = language === "tr" ? "OK (Hazır)" : "OK (Ready)";
      } else if (value === "near_end") {
        dotClass += " dot-warning";
        textClass += " text-warning";
        displayLabel = language === "tr" ? "AZALDI (Düşük)" : "NEAR END (Low)";
      } else if (value === "jam") {
        dotClass += " dot-danger";
        textClass += " text-danger";
        displayLabel = language === "tr" ? "SIKIŞTI" : "JAMMED";
      } else {
        dotClass += " dot-danger";
        textClass += " text-danger";
        displayLabel = language === "tr" ? "BİTTİ (Yok)" : "OUT (No Paper)";
      }
    } else if (field === "cover") {
      if (value === "closed") {
        dotClass += " dot-success";
        textClass += " text-success";
        displayLabel = language === "tr" ? "KAPALI (Güvenli)" : "CLOSED (Secure)";
      } else {
        dotClass += " dot-danger";
        textClass += " text-danger";
        displayLabel = language === "tr" ? "AÇIK (Uyarı)" : "OPEN (Warning)";
      }
    } else if (field === "temp") {
      if (value === "normal") {
        dotClass += " dot-success";
        textClass += " text-success";
        displayLabel = language === "tr" ? "NORMAL" : "NORMAL";
      } else {
        dotClass += " dot-danger";
        textClass += " text-danger";
        displayLabel = language === "tr" ? "AŞIRI ISINMA" : "OVERHEAT (Hot)";
      }
    } else if (field === "job") {
      if (value === "success") {
        dotClass += " dot-success";
        textClass += " text-success";
        displayLabel = language === "tr" ? "BAŞARILI" : "SUCCESS";
      } else if (value === "queued" || value === "printing") {
        dotClass += " dot-warning";
        textClass += " text-warning";
        displayLabel = translateTone(value as BadgeTone, language);
      } else {
        dotClass += " dot-danger";
        textClass += " text-danger";
        displayLabel = language === "tr" ? "BAŞARISIZ" : "FAILED";
      }
    }
    
    return (
      <div className="health-row">
        <span className={dotClass}></span>
        <span className={textClass}>{displayLabel}</span>
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
        <h2>
          <span className="step-badge">3</span>
          {language === "tr" ? "Cihaz Durumu & Tahminler" : "Device Status & Predictions"}
        </h2>
        {lastJob ? <StatusBadge tone={lastJob.status} label={translateTone(lastJob.status, language)} /> : null}
      </div>
      <div className="status-stack">
        <div className="status-section">
          <h3>{language === "tr" ? "Donanım" : "Hardware"}</h3>
          <dl className="facts-vertical">
            <div>
              <dt>{language === "tr" ? "Kağıt" : "Paper"}</dt>
              <dd>{renderHealthIndicator("paper", health?.paper)}</dd>
            </div>
            <div>
              <dt>{language === "tr" ? "Kapak" : "Cover"}</dt>
              <dd>{renderHealthIndicator("cover", health?.cover)}</dd>
            </div>
            <div>
              <dt>{language === "tr" ? "Sıcaklık" : "Temperature"}</dt>
              <dd>{renderHealthIndicator("temp", health?.temperature)}</dd>
            </div>
          </dl>
        </div>

        <div className="status-section">
          <h3>{language === "tr" ? "Son İş" : "Last job"}</h3>
          <dl className="facts-vertical">
            <div>
              <dt>{language === "tr" ? "Tür" : "Type"}</dt>
              <dd>{lastJob?.type ?? "-"}</dd>
            </div>
            <div>
              <dt>{language === "tr" ? "Durum" : "Status"}</dt>
              <dd>{lastJob ? renderHealthIndicator("job", lastJob.status) : "-"}</dd>
            </div>
            <div>
              <dt>{language === "tr" ? "Hata" : "Error"}</dt>
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
          <h3>{language === "tr" ? "Tahminler (Bonus)" : "Predictions (Bonus)"}</h3>
          <dl className="facts-vertical">
            <div>
              <dt>{language === "tr" ? "Kalan Rulo" : "Roll Remaining"}</dt>
              <dd>{status?.predictions ? `${status.predictions.remainingRollPercentage}%` : "-"}</dd>
            </div>
            <div>
              <dt>{language === "tr" ? "Rulo Uzunluğu" : "Roll Length"}</dt>
              <dd>{status?.predictions ? `${status.predictions.remainingRollMeters}m` : "-"}</dd>
            </div>
            <div>
              <dt>{language === "tr" ? "Kuyruk Süresi" : "Queue ETA"}</dt>
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
