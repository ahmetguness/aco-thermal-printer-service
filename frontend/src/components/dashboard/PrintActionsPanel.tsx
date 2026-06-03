import type { PrintLanguage } from "../../types/printer";

interface PrintActionsPanelProps {
  imageBase64: string;
  imageFilename: string;
  language: PrintLanguage;
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
}

export function PrintActionsPanel({
  imageBase64,
  imageFilename,
  language,
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
}: PrintActionsPanelProps) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Print Actions</h2>
      </div>

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
          ? "Dil: Türkçe — Kod sayfası: CP857"
          : "Language: English — Code page: CP437"}
      </p>

      <div className="action-rows">
        <div className="action-row-group">
          <div className="input-col">
            <label>Text</label>
            <input value={text} onChange={(event) => onTextChange(event.target.value)} placeholder="Merhaba ACO" />
          </div>
          <button className="action-button-main" type="button" onClick={onPrintText}>
            Print Text
          </button>
        </div>

        <div className="action-row-group">
          <div className="input-col">
            <label>QR Code Payload</label>
            <input value={qrData} onChange={(event) => onQrDataChange(event.target.value)} placeholder="https://aco-recycling.example/reward/abc123" />
          </div>
          <button className="action-button-main" type="button" onClick={onPrintQr}>
            Print QR
          </button>
        </div>

        <div className="action-row-group image-group">
          <div className="input-col flex-2">
            <label>Image Base64 Data</label>
            <input value={imageBase64} onChange={(event) => onImageBase64Change(event.target.value)} placeholder="BASE64_IMAGE_DATA" />
          </div>
          <div className="input-col flex-1">
            <label>Filename</label>
            <input value={imageFilename} onChange={(event) => onImageFilenameChange(event.target.value)} placeholder="receipt.png" />
          </div>
          <button className="action-button-main" type="button" onClick={onPrintImage}>
            Print Image
          </button>
        </div>

        <div className="action-row-group single-btn">
          <button className="primary-button print-receipt-btn" type="button" onClick={onPrintReceipt}>
            Print Sample Receipt
          </button>
        </div>
      </div>
    </section>
  );
}
