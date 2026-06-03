interface PrintActionsPanelProps {
  imageBase64: string;
  imageFilename: string;
  qrData: string;
  text: string;
  onImageBase64Change: (value: string) => void;
  onImageFilenameChange: (value: string) => void;
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
  qrData,
  text,
  onImageBase64Change,
  onImageFilenameChange,
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
      <div className="print-grid">
        <label>
          Text
          <input value={text} onChange={(event) => onTextChange(event.target.value)} />
        </label>
        <button type="button" onClick={onPrintText}>
          Print Text
        </button>
        <label>
          QR
          <input value={qrData} onChange={(event) => onQrDataChange(event.target.value)} />
        </label>
        <button type="button" onClick={onPrintQr}>
          Print QR
        </button>
        <label>
          Image base64
          <input value={imageBase64} onChange={(event) => onImageBase64Change(event.target.value)} />
        </label>
        <label>
          Filename
          <input value={imageFilename} onChange={(event) => onImageFilenameChange(event.target.value)} />
        </label>
        <button type="button" onClick={onPrintImage}>
          Print Image
        </button>
        <button type="button" onClick={onPrintReceipt}>
          Print Sample Receipt
        </button>
      </div>
    </section>
  );
}
