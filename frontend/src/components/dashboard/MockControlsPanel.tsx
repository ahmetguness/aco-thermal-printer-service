interface MockControlsPanelProps {
  language: "tr" | "en";
  onCoverOpen: () => void;
  onDisconnect: () => void;
  onOverheat: () => void;
  onPaperOut: () => void;
  onResetHealth: () => void;
}

export function MockControlsPanel({
  language,
  onCoverOpen,
  onDisconnect,
  onOverheat,
  onPaperOut,
  onResetHealth,
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
              ? "Yazıcıda kağıt bittiğini simüle eder. Gelecek baskılar PAPER_OUT hatası alır."
              : "Simulates that the printer is out of paper. Future print jobs will fail with a PAPER_OUT error."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onCoverOpen}>
            {language === "tr" ? "Kapak Açık (Cover Open)" : "Cover Open"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Yazıcı kapağının açık olduğunu simüle eder. Gelecek baskılar COVER_OPEN hatası alır."
              : "Simulates that the printer cover is open. Future print jobs will fail with a COVER_OPEN error."}
          </span>
        </div>

        <div className="button-stack-item">
          <button type="button" onClick={onOverheat}>
            {language === "tr" ? "Aşırı Isınma (Overheat)" : "Overheat"}
          </button>
          <span className="button-helper-text">
            {language === "tr"
              ? "Yazıcı kafasının aşırı ısındığını simüle eder. Gelecek baskılar OVERHEAT hatası alır."
              : "Simulates print head overheating. Future print jobs will fail with an OVERHEAT error."}
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
