interface MockControlsPanelProps {
  language: "tr" | "en";
  onCoverOpen: () => void;
  onDisconnect: () => void;
  onPaperJam: () => void;
  onOverheat: () => void;
  onPaperOut: () => void;
  onResetHealth: () => void;
  onUnknownCommand: () => void;
}

export function MockControlsPanel({
  language,
  onCoverOpen,
  onDisconnect,
  onPaperJam,
  onOverheat,
  onPaperOut,
  onResetHealth,
  onUnknownCommand,
}: MockControlsPanelProps) {
  return (
    <section className="panel simulation-panel">
      <div className="panel-header">
        <h2>
          <span className="step-badge" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>4</span>
          {language === "tr" ? "Test & Hata Simülasyonu" : "Testing & Error Simulation"}
        </h2>
      </div>
      <div className="button-stack">
        <div className="button-stack-item">
          <button type="button" onClick={onPaperOut}>
            {language === "tr" ? "Kağıt Bitti (Paper Out)" : "Paper Out"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Status hemen paper=out olur. Log kaydı, sonraki baskı PAPER_OUT ile başarısız olduğunda oluşur."
              : "Status changes to paper=out immediately. A log entry is created when the next print fails with PAPER_OUT."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onCoverOpen}>
            {language === "tr" ? "Kapak Açık (Cover Open)" : "Cover Open"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Status hemen cover=open olur. Log kaydı, sonraki baskı COVER_OPEN ile başarısız olduğunda oluşur."
              : "Status changes to cover=open immediately. A log entry is created when the next print fails with COVER_OPEN."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onOverheat}>
            {language === "tr" ? "Aşırı Isınma (Overheat)" : "Overheat"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Status hemen temperature=overheat olur. Log kaydı, sonraki baskı OVERHEAT ile başarısız olduğunda oluşur."
              : "Status changes to temperature=overheat immediately. A log entry is created when the next print fails with OVERHEAT."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onPaperJam}>
            {language === "tr" ? "Kağıt Sıkışması (Paper Jam)" : "Paper Jam"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Anında test baskısı oluşturur, işi PAPER_JAM ile failed yapar ve loglara kaydeder."
              : "Creates a test print immediately, marks it failed with PAPER_JAM and writes it to the logs."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onUnknownCommand}>
            {language === "tr" ? "Bilinmeyen Komut (Unknown Command)" : "Unknown Command"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Anında test baskısı oluşturur, işi UNKNOWN_COMMAND ile failed yapar ve loglara kaydeder."
              : "Creates a test print immediately, marks it failed with UNKNOWN_COMMAND and writes it to the logs."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onResetHealth} style={{ borderColor: "rgba(16, 185, 129, 0.4)", color: "#a7f3d0" }}>
            {language === "tr" ? "Sağlık Durumunu Sıfırla (Hataları Gider)" : "Reset Health (Resolve Errors)"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Tüm sensörleri normale (OK) döndürür ve kağıt seviyesini %100 (%50.0m) yapar."
              : "Restores all sensors back to normal (OK) and resets paper roll level back to 100% (50.0m)."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onDisconnect}>
            {language === "tr" ? "Bağlantı Kesilmesini Simüle Et" : "Simulate Disconnect"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Donanım bağlantısının koptuğunu simüle ederek otomatik yeniden bağlanma sürecini tetikler."
              : "Forces connection loss to simulate hardware disconnection, triggering the auto-reconnection schedule."}
          </span>
        </div>
      </div>
    </section>
  );
}
