import {
  createSampleReceipt,
  formatReceiptIssuedAt,
  formatReceiptReward,
  getReceiptTotal,
} from "../../data/sampleReceipt";
import logo from "../../assets/logo/logo.png";
import type { PrintLanguage, ReceiptPrintRequest } from "../../types/printer";

interface PrintActionsPanelProps {
  imageBase64: string;
  imageFilename: string;
  language: PrintLanguage;
  uiLanguage: "tr" | "en";
  qrData: string;
  text: string;
  onImageBase64Change: (value: string) => void;
  onImageFilenameChange: (value: string) => void;
  onLanguageChange: (language: PrintLanguage) => void;
  onPrintImage: () => void;
  onPrintQr: () => void;
  onPrintReceipt: () => void;
  onPrintText: () => void;
  onQrDataChange: (value: string) => void;
  onTextChange: (value: string) => void;
  isConnected: boolean;
  hasError: boolean;
}

export function PrintActionsPanel({
  imageBase64,
  imageFilename,
  language,
  uiLanguage,
  qrData,
  text,
  onImageBase64Change,
  onImageFilenameChange,
  onLanguageChange,
  onPrintImage,
  onPrintQr,
  onPrintReceipt,
  onPrintText,
  onQrDataChange,
  onTextChange,
  isConnected,
  hasError,
}: PrintActionsPanelProps) {
  const baseSampleReceipt = createSampleReceipt(language);
  const sampleReceipt: ReceiptPrintRequest = {
    ...baseSampleReceipt,
    qrPayload: qrData.trim() || baseSampleReceipt.qrPayload,
  };
  const receiptTotal = getReceiptTotal(sampleReceipt.items);

  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>
          <span className="step-badge">2</span>
          {uiLanguage === "tr" ? "Yazdırma Eylemleri & Canlı Önizleme" : "Print Actions & Live Preview"}
        </h2>
      </div>

      <div className="print-actions-split">
        {/* Left Side: Controls & Inputs */}
        <div className="print-actions-inputs">
          <p className="hint" style={{ marginBottom: "8px", fontWeight: "bold" }}>
            {uiLanguage === "tr" ? "Yazıcı Baskı Dili (ESC/POS)" : "Printer Print Language (ESC/POS)"}
          </p>
          <div className="segmented">
            <button className={language === "tr" ? "active" : ""} type="button" onClick={() => onLanguageChange("tr")}>
              Türkçe
            </button>
            <button className={language === "en" ? "active" : ""} type="button" onClick={() => onLanguageChange("en")}>
              English
            </button>
          </div>
          <p className="hint" style={{ marginBottom: "14px" }}>
            {language === "tr"
              ? (uiLanguage === "tr" ? "Dil: Türkçe — Kod sayfası: CP857" : "Language: Turkish — Code page: CP857")
              : (uiLanguage === "tr" ? "Dil: İngilizce — Kod sayfası: CP437" : "Language: English — Code page: CP437")}
          </p>

          <div className="action-rows">
            <div className="action-row-group">
              <div className="input-col">
                <label>{uiLanguage === "tr" ? "Metin" : "Text"}</label>
                <input
                  value={text}
                  onChange={(event) => onTextChange(event.target.value)}
                  placeholder="Merhaba ACO"
                />
              </div>
              <button
                className="action-button-main"
                type="button"
                onClick={() => {
                  onPrintText();
                }}
              >
                {uiLanguage === "tr" ? "Metin Yazdır" : "Print Text"}
              </button>
            </div>

            <div className="action-row-group">
              <div className="input-col">
                <label>{uiLanguage === "tr" ? "QR Kod Verisi" : "QR Code Payload"}</label>
                <input
                  value={qrData}
                  onChange={(event) => onQrDataChange(event.target.value)}
                  placeholder="https://aco-recycling.example/reward/abc123"
                />
              </div>
              <button
                className="action-button-main"
                type="button"
                onClick={() => {
                  onPrintQr();
                }}
              >
                {uiLanguage === "tr" ? "QR Yazdır" : "Print QR"}
              </button>
            </div>

            <div className="action-row-group image-group" style={{ flexDirection: "column", alignItems: "stretch", gap: "14px" }}>
              {/* Row 1: Image Base64 + Upload Button */}
              <div style={{ display: "flex", gap: "12px", width: "100%", alignItems: "flex-end" }}>
                <div className="input-col" style={{ flex: 1 }}>
                  <label>{uiLanguage === "tr" ? "Görsel Base64 Verisi" : "Image Base64 Data"}</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      value={imageBase64}
                      onChange={(event) => onImageBase64Change(event.target.value)}
                      placeholder="BASE64_IMAGE_DATA"
                      style={{ flex: 1 }}
                    />
                    <label className="ghost-button" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.8rem", padding: "0 16px", minHeight: "44px", margin: 0, whiteSpace: "nowrap" }}>
                      {uiLanguage === "tr" ? "Yükle" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            onImageFilenameChange(file.name);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              onImageBase64Change(base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 2: Filename + Print Image Button */}
              <div style={{ display: "flex", gap: "12px", width: "100%", alignItems: "flex-end" }}>
                <div className="input-col" style={{ flex: 1 }}>
                  <label>{uiLanguage === "tr" ? "Dosya Adı" : "Filename"}</label>
                  <input
                    value={imageFilename}
                    onChange={(event) => onImageFilenameChange(event.target.value)}
                    placeholder="receipt.png"
                  />
                </div>
                <button
                  className="action-button-main"
                  type="button"
                  style={{ flex: 1 }}
                  onClick={() => {
                    onPrintImage();
                  }}
                >
                  {uiLanguage === "tr" ? "Görsel Yazdır" : "Print Image"}
                </button>
              </div>
            </div>

            <div className="action-row-group single-btn">
              <button
                className="primary-button print-receipt-btn"
                type="button"
                onClick={() => {
                  onPrintReceipt();
                }}
              >
                {uiLanguage === "tr" ? "Örnek Fiş Yazdır" : "Print Sample Receipt"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Thermal Receipt Preview */}
        <div className="ticket-preview-container">
          <div className="ticket-preview-header">
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {uiLanguage === "tr" ? "Dinamik Fiş Önizleme" : "Dynamic Receipt Preview"}
              <span
                className={`status-led ${isConnected && !hasError ? "led-online" : "led-offline"}`}
                title={
                  isConnected
                    ? (hasError ? (uiLanguage === "tr" ? "Yazıcı Hatası" : "Printer Warning") : (uiLanguage === "tr" ? "Yazıcı Çevrimiçi" : "Printer Online"))
                    : (uiLanguage === "tr" ? "Yazıcı Çevrimdışı" : "Printer Offline")
                }
              />
            </span>
          </div>

          <div className="ticket-paper">
            <ReceiptPreview
              imageBase64={imageBase64}
              imageFilename={imageFilename}
              language={language}
              receipt={sampleReceipt}
              text={text}
              total={receiptTotal}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface ReceiptPreviewProps {
  imageBase64: string;
  imageFilename: string;
  language: PrintLanguage;
  receipt: ReceiptPrintRequest;
  text: string;
  total: number;
}

function ReceiptPreview({ imageBase64, imageFilename, language, receipt, text, total }: ReceiptPreviewProps) {
  const imageSource = resolvePreviewImageSource(imageBase64);
  const message = text.trim();

  return (
    <div className="receipt-preview">
      <div className="receipt-logo-row">
        <img alt="ACO Recycling" className="receipt-logo" src={logo} />
      </div>

      <div className="receipt-machine">MachineID: {receipt.machineId}</div>
      <div className="receipt-date">{formatReceiptIssuedAt(receipt.issuedAt ?? "", language)} UTC</div>
      <div className="receipt-reward-name">{receipt.rewardName}</div>
      {message ? <div className="receipt-message">{message}</div> : null}
      {imageSource ? (
        <div className="receipt-image-block">
          <img alt={imageFilename || "Receipt bitmap"} className="receipt-user-image" src={imageSource} />
        </div>
      ) : null}
      <div className="receipt-total">
        {language === "tr" ? "Ödül" : "Reward"}: {formatReceiptReward(total, receipt.currency)}
      </div>

      <table className="ticket-receipt-table receipt-reference-table">
        <thead>
          <tr>
            <th>{language === "tr" ? "Ürün" : "Product"}</th>
            <th>{language === "tr" ? "Adet" : "Quantity"}</th>
            <th>{language === "tr" ? "Ödül" : "Reward"}</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.product}>
              <td>{getReceiptProductLabel(item.product, language)}</td>
              <td>{item.quantity}</td>
              <td>{formatReceiptTableReward(item.reward)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-qr-code" aria-label={receipt.qrPayload}>
        <QrMatrix value={receipt.qrPayload ?? ""} />
        <div className="mock-qr-corner mock-qr-tl"></div>
        <div className="mock-qr-tr mock-qr-corner"></div>
        <div className="mock-qr-bl mock-qr-corner"></div>
      </div>
    </div>
  );
}

function QrMatrix({ value }: { value: string }) {
  const cells = buildQrCells(value);

  return (
    <div className="receipt-qr-matrix" aria-hidden="true">
      {cells.map((isDark, index) => (
        <span className={isDark ? "qr-cell-dark" : "qr-cell-light"} key={index} />
      ))}
    </div>
  );
}

function getReceiptProductLabel(product: string, language: PrintLanguage): string {
  const labels: Record<string, { tr: string; en: string }> = {
    Glass: { tr: "Cam", en: "Glass" },
    Plastic: { tr: "Plastik", en: "Plastic" },
    Metal: { tr: "Metal", en: "Metal" },
    Tetrapak: { tr: "Tetrapak", en: "Tetrapak" },
  };

  return labels[product]?.[language] ?? product;
}

function formatReceiptTableReward(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function resolvePreviewImageSource(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === "BASE64_IMAGE_DATA") {
    return null;
  }

  if (trimmedValue.startsWith("data:image/")) {
    return trimmedValue;
  }

  return `data:image/png;base64,${trimmedValue}`;
}

function buildQrCells(value: string): boolean[] {
  const size = 21;
  const cells = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;

    if (isFinderPattern(row, col, 0, 0) || isFinderPattern(row, col, 0, 14) || isFinderPattern(row, col, 14, 0)) {
      return false;
    }

    if (row === 6 || col === 6) {
      return (row + col) % 2 === 0;
    }

    const hash = hashQrCell(value, row, col);
    return hash % 5 < 2;
  });

  drawFinderPattern(cells, size, 0, 0);
  drawFinderPattern(cells, size, 0, 14);
  drawFinderPattern(cells, size, 14, 0);

  return cells;
}

function isFinderPattern(row: number, col: number, startRow: number, startCol: number): boolean {
  return row >= startRow && row < startRow + 7 && col >= startCol && col < startCol + 7;
}

function drawFinderPattern(cells: boolean[], size: number, startRow: number, startCol: number): void {
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const isOuter = row === 0 || row === 6 || col === 0 || col === 6;
      const isInner = row >= 2 && row <= 4 && col >= 2 && col <= 4;
      cells[(startRow + row) * size + startCol + col] = isOuter || isInner;
    }
  }
}

function hashQrCell(value: string, row: number, col: number): number {
  let hash = 2166136261;
  const source = `${value}|${row}|${col}`;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
