import { useCallback, useEffect, useMemo, useState } from "react";
import { ConnectionPanel } from "../components/dashboard/ConnectionPanel";
import { LogsPanel } from "../components/dashboard/LogsPanel";
import { MockControlsPanel } from "../components/dashboard/MockControlsPanel";
import { PrintActionsPanel } from "../components/dashboard/PrintActionsPanel";
import { QueuePanel } from "../components/dashboard/QueuePanel";
import { StatusPanel } from "../components/dashboard/StatusPanel";
import {
  connect,
  getLogs,
  getStatus,
  isFailure,
  printImage,
  printQr,
  printReceipt,
  printText,
  reprint,
  setMockHealth,
  simulateDisconnect,
} from "../lib/api";
import type { ApiError } from "../types/api";
import type { ConnectionMode, LogEntry, PrintLanguage, PrinterStatus } from "../types/printer";

type LoadState = "idle" | "loading" | "ready" | "error";

const receiptExample = (language: PrintLanguage) => ({
  machineId: "ACO-TEST-0001-0001",
  rewardName: "Aco Recycling Default Reward",
  currency: "TRY",
  issuedAt: "2025-09-16T16:19:02.000Z",
  items: [
    { product: "Glass", quantity: 0, reward: 0 },
    { product: "Plastic", quantity: 2, reward: 2 },
    { product: "Metal", quantity: 1, reward: 1 },
    { product: "Tetrapak", quantity: 0, reward: 0 },
  ],
  qrPayload: "ACO-TEST-0001-0001|3.00",
  language,
});

export function DashboardPage() {
  const [mode, setMode] = useState<ConnectionMode>("usb");
  const [language, setLanguage] = useState<PrintLanguage>("tr");
  const [uiLanguage, setUiLanguage] = useState<"tr" | "en">("tr");
  const [status, setStatus] = useState<PrinterStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("Merhaba ACO");
  const [qrData, setQrData] = useState("https://aco-recycling.example/reward/abc123");
  const [imageBase64, setImageBase64] = useState("BASE64_IMAGE_DATA");
  const [imageFilename, setImageFilename] = useState("receipt.png");

  const lastFailedJob = useMemo(
    () => (status?.lastJob?.status === "failed" ? status.lastJob : null),
    [status],
  );

  const refresh = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const [statusResponse, logsResponse] = await Promise.all([
        getStatus(),
        getLogs(),
      ]);

      if (isFailure(statusResponse)) {
        throw apiErrorToError(statusResponse.error);
      }

      if (isFailure(logsResponse)) {
        throw apiErrorToError(logsResponse.error);
      }

      setStatus(statusResponse.data);
      setLogs(logsResponse.data.slice(-20).reverse());
      setLoadState("ready");
    } catch (caughtError) {
      setLoadState("error");
      setError(caughtError instanceof Error ? caughtError.message : "Beklenmeyen bir hata olustu.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [refresh]);

  async function runAction(action: () => Promise<void>): Promise<void> {
    setError(null);

    try {
      await action();
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Islem tamamlanamadi.");
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">{uiLanguage === "tr" ? "ACO Termal Yazıcı Servisi" : "ACO Thermal Printer Service"}</p>
          <h1>{uiLanguage === "tr" ? "Yazıcı Kontrol Paneli" : "Printer Control Panel"}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="segmented" style={{ marginBottom: 0, padding: "2px" }}>
            <button
              className={uiLanguage === "tr" ? "active" : ""}
              style={{ minHeight: "32px", padding: "4px 12px", fontSize: "0.8rem" }}
              type="button"
              onClick={() => setUiLanguage("tr")}
            >
              TR
            </button>
            <button
              className={uiLanguage === "en" ? "active" : ""}
              style={{ minHeight: "32px", padding: "4px 12px", fontSize: "0.8rem" }}
              type="button"
              onClick={() => setUiLanguage("en")}
            >
              EN
            </button>
          </div>
          <button className="ghost-button" type="button" onClick={() => void refresh()}>
            {uiLanguage === "tr" ? "Yenile" : "Refresh"}
          </button>
        </div>
      </header>

      {error ? <div className="banner">{error}</div> : null}

      <section className="dashboard-grid-two-col">
        <ConnectionPanel
          mode={mode}
          connection={status?.connection ?? null}
          loadState={loadState}
          language={uiLanguage}
          onConnect={() =>
            void runAction(async () => {
              const response = await connect(mode);
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
          onModeChange={setMode}
        />
        <StatusPanel status={status} language={uiLanguage} />

        <PrintActionsPanel
          text={text}
          qrData={qrData}
          imageBase64={imageBase64}
          imageFilename={imageFilename}
          language={language}
          uiLanguage={uiLanguage}
          onTextChange={setText}
          onQrDataChange={setQrData}
          onImageBase64Change={setImageBase64}
          onImageFilenameChange={setImageFilename}
          onLanguageChange={setLanguage}
          isConnected={status?.connection?.state === "connected"}
          hasError={
            status?.lastJob?.status === "failed" ||
            status?.health?.paper === "out" ||
            status?.health?.cover === "open" ||
            status?.health?.temperature === "overheat"
          }
          onPrintText={() =>
            void runAction(async () => {
              const response = await printText({ text, language });
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
          onPrintQr={() =>
            void runAction(async () => {
              const response = await printQr({ data: qrData });
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
          onPrintImage={() =>
            void runAction(async () => {
              const response = await printImage({
                imageBase64,
                filename: imageFilename,
              });
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
          onPrintReceipt={() =>
            void runAction(async () => {
              const response = await printReceipt(receiptExample(language));
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
        />

        <QueuePanel
          queue={status?.queue ?? null}
          lastJob={status?.lastJob ?? null}
          lastFailedJob={lastFailedJob}
          language={uiLanguage}
          onReprint={() =>
            void runAction(async () => {
              if (!lastFailedJob) return;
              const response = await reprint(lastFailedJob.id);
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
        />
        <MockControlsPanel
          language={uiLanguage}
          onPaperOut={() => void runAction(() => setHealth({ paper: "out" }))}
          onCoverOpen={() => void runAction(() => setHealth({ cover: "open" }))}
          onOverheat={() => void runAction(() => setHealth({ temperature: "overheat" }))}
          onResetHealth={() => void runAction(() => setHealth({ paper: "ok", cover: "closed", temperature: "normal" }))}
          onDisconnect={() =>
            void runAction(async () => {
              const response = await simulateDisconnect();
              if (isFailure(response)) throw apiErrorToError(response.error);
            })
          }
        />

        <LogsPanel logs={logs} language={uiLanguage} />
      </section>
    </main>
  );
}

async function setHealth(body: Parameters<typeof setMockHealth>[0]): Promise<void> {
  const response = await setMockHealth(body);
  if (isFailure(response)) throw apiErrorToError(response.error);
}

function apiErrorToError(error: ApiError): Error {
  return new Error(`${error.code}: ${error.message}`);
}
