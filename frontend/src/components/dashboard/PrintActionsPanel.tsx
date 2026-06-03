import { useState } from "react";
import type { PrintLanguage } from "../../types/printer";

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
  const [previewTab, setPreviewTab] = useState<"text" | "qr" | "image" | "receipt">("text");

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
                  onChange={(event) => {
                    onTextChange(event.target.value);
                    setPreviewTab("text");
                  }}
                  onFocus={() => setPreviewTab("text")}
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
                  onChange={(event) => {
                    onQrDataChange(event.target.value);
                    setPreviewTab("qr");
                  }}
                  onFocus={() => setPreviewTab("qr")}
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
                      onChange={(event) => {
                        onImageBase64Change(event.target.value);
                        setPreviewTab("image");
                      }}
                      onFocus={() => setPreviewTab("image")}
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
                            setPreviewTab("image");
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
                    onChange={(event) => {
                      onImageFilenameChange(event.target.value);
                      setPreviewTab("image");
                    }}
                    onFocus={() => setPreviewTab("image")}
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
            <div className="segmented" style={{ marginBottom: 0, padding: "2px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", width: "280px" }}>
              <button
                className={previewTab === "text" ? "active" : ""}
                style={{ minHeight: "26px", fontSize: "0.75rem", padding: "2px 4px", width: "100%" }}
                type="button"
                onClick={() => setPreviewTab("text")}
              >
                {uiLanguage === "tr" ? "Metin" : "Text"}
              </button>
              <button
                className={previewTab === "qr" ? "active" : ""}
                style={{ minHeight: "26px", fontSize: "0.75rem", padding: "2px 4px", width: "100%" }}
                type="button"
                onClick={() => setPreviewTab("qr")}
              >
                QR
              </button>
              <button
                className={previewTab === "image" ? "active" : ""}
                style={{ minHeight: "26px", fontSize: "0.75rem", padding: "2px 4px", width: "100%" }}
                type="button"
                onClick={() => setPreviewTab("image")}
              >
                {uiLanguage === "tr" ? "Görsel" : "Image"}
              </button>
              <button
                className={previewTab === "receipt" ? "active" : ""}
                style={{ minHeight: "26px", fontSize: "0.75rem", padding: "2px 4px", width: "100%" }}
                type="button"
                onClick={() => setPreviewTab("receipt")}
              >
                {uiLanguage === "tr" ? "Fiş" : "Receipt"}
              </button>
            </div>
          </div>

          <div className="ticket-paper">
            <div className="ticket-header-area">
              *** ACO RECYCLING ***
              <br />
              {language === "tr" ? "AKILLI İADE GERİ KAZANIM" : "SMART DEPOSIT REVENUE"}
              <div className="ticket-divider"></div>
            </div>

            <div className="ticket-content">
              {previewTab === "text" && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: "0.7rem", color: "#666", display: "block", marginBottom: "8px", fontStyle: "italic" }}>
                    {language === "tr" ? "[ METİN BASKI ÖNİZLEMESİ ]" : "[ TEXT PRINT PREVIEW ]"}
                  </span>
                  <strong style={{ fontSize: "0.9rem" }}>{text || (language === "tr" ? "(Boş Metin)" : "(Empty Text)")}</strong>
                </div>
              )}

              {previewTab === "qr" && (
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "#666", display: "block", marginBottom: "4px", fontStyle: "italic" }}>
                    {language === "tr" ? "[ QR KOD ÖNİZLEMESİ ]" : "[ QR CODE PREVIEW ]"}
                  </span>
                  <div className="mock-qr-code">
                    <div className="mock-qr-pattern"></div>
                    <div className="mock-qr-corner mock-qr-tl"></div>
                    <div className="mock-qr-tr mock-qr-corner"></div>
                    <div className="mock-qr-bl mock-qr-corner"></div>
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "#333", wordBreak: "break-all", display: "block", marginTop: "4px" }}>
                    {qrData || "https://aco-recycling.com"}
                  </span>
                </div>
              )}

              {previewTab === "image" && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: "0.7rem", color: "#666", display: "block", marginBottom: "4px", fontStyle: "italic" }}>
                    {language === "tr" ? "[ GÖRSEL BASKI ÖNİZLEMESİ ]" : "[ BITMAP IMAGE PREVIEW ]"}
                  </span>
                  <div style={{ border: "1px dashed #888", padding: "12px 8px", margin: "8px 0", borderRadius: "3px", background: "#f5f5f0" }}>
                    {imageBase64 && imageBase64 !== "BASE64_IMAGE_DATA" ? (
                      <img
                        src={imageBase64.startsWith("data:image/") ? imageBase64 : `data:image/png;base64,${imageBase64}`}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "140px", height: "auto", display: "block", margin: "0 auto", borderRadius: "2px", objectFit: "contain" }}
                      />
                    ) : (
                      <>
                        {language === "tr" ? "[ GÖRSEL YAZDIRILDI ]" : "[ IMAGE RENDERED ]"}
                        <br />
                        <span style={{ fontSize: "0.68rem", color: "#555", fontWeight: "bold" }}>
                          {imageFilename || "receipt.png"}
                        </span>
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "#888", display: "block" }}>
                    Base64: {imageBase64 ? `${imageBase64.substring(0, 24)}...` : (language === "tr" ? "(Boş)" : "(Empty)")}
                  </span>
                </div>
              )}

              {previewTab === "receipt" && (
                <div>
                  <div style={{ fontSize: "0.75rem", marginBottom: "4px", lineHeight: "1.3" }}>
                    {language === "tr" ? "Cihaz ID: ACO-TEST-0001" : "Machine: ACO-TEST-0001"}
                    <br />
                    {language === "tr" ? "Tarih: 16.09.2025 16:19" : "Date: 16.09.2025 16:19"}
                  </div>
                  <div className="ticket-divider"></div>
                  <table className="ticket-receipt-table">
                    <thead>
                      <tr>
                        <th>{language === "tr" ? "Malzeme" : "Material"}</th>
                        <th style={{ textAlign: "center" }}>{language === "tr" ? "Adet" : "Qty"}</th>
                        <th style={{ textAlign: "right" }}>{language === "tr" ? "Ödül" : "Reward"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{language === "tr" ? "Cam (Glass)" : "Glass (Cam)"}</td>
                        <td style={{ textAlign: "center" }}>0</td>
                        <td style={{ textAlign: "right" }}>0.00 TL</td>
                      </tr>
                      <tr>
                        <td>{language === "tr" ? "Plastik (Plastic)" : "Plastic (Plastik)"}</td>
                        <td style={{ textAlign: "center" }}>2</td>
                        <td style={{ textAlign: "right" }}>2.00 TL</td>
                      </tr>
                      <tr>
                        <td>{language === "tr" ? "Metal (Metal)" : "Metal (Metal)"}</td>
                        <td style={{ textAlign: "center" }}>1</td>
                        <td style={{ textAlign: "right" }}>1.00 TL</td>
                      </tr>
                      <tr>
                        <td>Tetrapak</td>
                        <td style={{ textAlign: "center" }}>0</td>
                        <td style={{ textAlign: "right" }}>0.00 TL</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="ticket-receipt-total">
                    <span>{language === "tr" ? "TOPLAM ÖDÜL:" : "TOTAL REWARD:"}</span>
                    <span>3.00 TL</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ticket-divider"></div>
            <div className="ticket-footer-area">
              TEŞEKKÜRLER / THANK YOU
              <br />
              ACO RECYCLING SMART INITIATIVES
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
