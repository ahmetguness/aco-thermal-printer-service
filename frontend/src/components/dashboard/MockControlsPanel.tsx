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
  const resetCopy = {
    title: language === "tr" ? "Sağlık Durumunu Sıfırla" : "Reset Health",
    subtitle: language === "tr" ? "Hataları Gider" : "Resolve Errors",
    helper:
      language === "tr"
        ? "Tüm sensörleri normale (OK) döndürür ve kağıt seviyesini %100 (%50.0m) yapar."
        : "Restores all sensors back to normal (OK) and resets paper roll level back to 100% (50.0m).",
  };

  const sensorActions = [
    {
      title: language === "tr" ? "Kağıt Bitti" : "Paper Out",
      code: "PAPER_OUT",
      onClick: onPaperOut,
      helper:
        language === "tr"
          ? "Status hemen paper=out olur. Log kaydı sonraki başarısız baskıda oluşur."
          : "Status changes to paper=out immediately. A log entry is created on the next failed print.",
    },
    {
      title: language === "tr" ? "Kapak Açık" : "Cover Open",
      code: "COVER_OPEN",
      onClick: onCoverOpen,
      helper:
        language === "tr"
          ? "Status hemen cover=open olur. Log kaydı sonraki başarısız baskıda oluşur."
          : "Status changes to cover=open immediately. A log entry is created on the next failed print.",
    },
    {
      title: language === "tr" ? "Aşırı Isınma" : "Overheat",
      code: "OVERHEAT",
      onClick: onOverheat,
      helper:
        language === "tr"
          ? "Status hemen temperature=overheat olur. Log kaydı sonraki başarısız baskıda oluşur."
          : "Status changes to temperature=overheat immediately. A log entry is created on the next failed print.",
    },
  ];

  const printErrorActions = [
    {
      title: language === "tr" ? "Kağıt Sıkışması" : "Paper Jam",
      code: "PAPER_JAM",
      onClick: onPaperJam,
      helper:
        language === "tr"
          ? "Anında test baskısı oluşturur, işi failed yapar ve loglara kaydeder."
          : "Creates a test print immediately, marks it failed and writes it to the logs.",
    },
    {
      title: language === "tr" ? "Bilinmeyen Komut" : "Unknown Command",
      code: "UNKNOWN_COMMAND",
      onClick: onUnknownCommand,
      helper:
        language === "tr"
          ? "Anında test baskısı oluşturur, işi failed yapar ve loglara kaydeder."
          : "Creates a test print immediately, marks it failed and writes it to the logs.",
    },
    {
      title: language === "tr" ? "Bağlantı Kesilmesi" : "Disconnect",
      code: "DISCONNECT",
      onClick: onDisconnect,
      helper:
        language === "tr"
          ? "Donanım bağlantısının koptuğunu simüle eder ve yeniden bağlanma sürecini tetikler."
          : "Forces connection loss and triggers the auto-reconnection schedule.",
    },
  ];

  return (
    <section className="panel simulation-panel">
      <div className="panel-header">
        <h2>
          <span className="step-badge" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>4</span>
          {language === "tr" ? "Test & Hata Simülasyonu" : "Testing & Error Simulation"}
        </h2>
      </div>

      <div className="simulation-content">
        <button className="simulation-reset-action" type="button" onClick={onResetHealth}>
          <span className="simulation-action-copy">
            <span>{resetCopy.title}</span>
            <strong>{resetCopy.subtitle}</strong>
            <small>{resetCopy.helper}</small>
          </span>
          <span className="simulation-action-code">OK</span>
        </button>

        <div className="simulation-groups">
          <div className="simulation-group">
            <h3>{language === "tr" ? "Sensör Durumları" : "Sensor States"}</h3>
            <div className="simulation-action-grid">
              {sensorActions.map((action) => (
                <button className="simulation-action-card" key={action.code} type="button" onClick={action.onClick}>
                  <span className="simulation-action-copy">
                    <span>{action.title}</span>
                    <strong>{action.code}</strong>
                    <small>{action.helper}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="simulation-group">
            <h3>{language === "tr" ? "Baskı ve Bağlantı Hataları" : "Print & Connection Errors"}</h3>
            <div className="simulation-action-grid">
              {printErrorActions.map((action) => (
                <button className="simulation-action-card" key={action.code} type="button" onClick={action.onClick}>
                  <span className="simulation-action-copy">
                    <span>{action.title}</span>
                    <strong>{action.code}</strong>
                    <small>{action.helper}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
