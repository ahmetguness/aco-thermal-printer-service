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
  logExportUrl,
  printImage,
  printQr,
  printReceipt,
  printText,
  reprint,
  setMockHealth,
  simulateDisconnect,
} from "../lib/api";
import type { ApiError } from "../types/api";
import type { ConnectionMode, LogEntry, PrinterStatus } from "../types/printer";

type LoadState = "idle" | "loading" | "ready" | "error";

const receiptExample = {
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
};

export function DashboardPage() {
  const [mode, setMode] = useState<ConnectionMode>("usb");
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

      if (!statusResponse.success) {
        throw apiErrorToError(statusResponse.error);
      }

      if (!logsResponse.success) {
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
          <p className="eyebrow">ACO Thermal Printer Service</p>
          <h1>Printer Control Panel</h1>
        </div>
        <button className="ghost-button" type="button" onClick={() => void refresh()}>
          Refresh
        </button>
      </header>

      {error ? <div className="banner">{error}</div> : null}

      <section className="dashboard-grid">
        <div className="top-grid">
          <ConnectionPanel
            mode={mode}
            connection={status?.connection ?? null}
            loadState={loadState}
            onConnect={() =>
              void runAction(async () => {
                const response = await connect(mode);
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
            onModeChange={setMode}
          />
          <StatusPanel status={status} />
        </div>

        <div className="middle-grid">
          <PrintActionsPanel
            text={text}
            qrData={qrData}
            imageBase64={imageBase64}
            imageFilename={imageFilename}
            onTextChange={setText}
            onQrDataChange={setQrData}
            onImageBase64Change={setImageBase64}
            onImageFilenameChange={setImageFilename}
            onPrintText={() =>
              void runAction(async () => {
                const response = await printText({ text, language: "tr" });
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
            onPrintQr={() =>
              void runAction(async () => {
                const response = await printQr({ data: qrData });
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
            onPrintImage={() =>
              void runAction(async () => {
                const response = await printImage({
                  imageBase64,
                  filename: imageFilename,
                });
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
            onPrintReceipt={() =>
              void runAction(async () => {
                const response = await printReceipt(receiptExample);
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
          />
        </div>

        <div className="bottom-grid">
          <QueuePanel
            queue={status?.queue ?? null}
            lastJob={status?.lastJob ?? null}
            lastFailedJob={lastFailedJob}
            onReprint={() =>
              void runAction(async () => {
                if (!lastFailedJob) return;
                const response = await reprint(lastFailedJob.id);
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
          />
          <MockControlsPanel
            onPaperOut={() => void runAction(() => setHealth({ paper: "out" }))}
            onCoverOpen={() => void runAction(() => setHealth({ cover: "open" }))}
            onOverheat={() => void runAction(() => setHealth({ temperature: "overheat" }))}
            onResetHealth={() => void runAction(() => setHealth({ paper: "ok", cover: "closed", temperature: "normal" }))}
            onDisconnect={() =>
              void runAction(async () => {
                const response = await simulateDisconnect();
                if (!response.success) throw apiErrorToError(response.error);
              })
            }
          />
          <LogsPanel exportUrl={logExportUrl} logs={logs} />
        </div>
      </section>
    </main>
  );
}

async function setHealth(body: Parameters<typeof setMockHealth>[0]): Promise<void> {
  const response = await setMockHealth(body);
  if (!response.success) throw apiErrorToError(response.error);
}

function apiErrorToError(error: ApiError): Error {
  return new Error(`${error.code}: ${error.message}`);
}
