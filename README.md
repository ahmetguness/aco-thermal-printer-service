# ACO Thermal Printer Service

Bu proje, termal yazıcı entegrasyonu için hazırlanmış lokal çalışan bir backend servisidir. Fiziksel yazıcı zorunlu olmadığı için servis şu anda mock printer adapter ile çalışır. Yapı, ileride gerçek USB veya LAN haberleşmesi eklenecek şekilde ayrılmıştır.

## Kurulum

Backend klasörüne geçip bağımlılıkları yükleyin:

```bash
cd backend
npm install
```

Örnek ortam dosyası:

```env
PORT=3000
```

Gerçek çalışma için `backend/.env` dosyası oluşturulabilir. Örnek değer `backend/.env.example` içinde bulunur.

## Çalıştırma

Build almak için:

```bash
npm run build
```

Servisi başlatmak için:

```bash
npm start
```

Geliştirme modunda çalıştırmak için:

```bash
npm run dev
```

Varsayılan port `3000`'dir. Servis `http://localhost:3000` üzerinden çalışır.

## Docker ile Çalıştırma

Docker kullanmak için proje kök dizininde şu komut çalıştırılabilir:

```bash
docker compose up --build
```

Servis yine `http://localhost:3000` üzerinden erişilebilir olur. Log ve failed image çıktıları container içinde `/app/storage` altında tutulur ve compose volume ile saklanır.

## Mimari

Backend TypeScript ve Express ile yazılmıştır. Katmanlar basit tutuldu:

```txt
backend/src
  app.ts                     Express setup
  server.ts                  Port dinleme
  controllers/               HTTP request/response katmanı
  routes/                    Endpoint tanımları
  services/                  Printer, adapter ve ESC/POS mock servisleri
  queue/                     Job queue yönetimi
  logs/                      JSON loglama ve CSV export
  types/                     Ortak TypeScript tipleri
  utils/                     Lightweight validation
```

Job queue memory üzerinde tutulur. Loglar ve basılamayan görsel payloadları dosya sistemine yazılır:

```txt
backend/storage/logs.json
backend/storage/failed-images/
```

Bu tercih demo kapsamı için bilinçli olarak yapıldı. Job queue ve bağlantı durumu servis çalıştığı sürece memory üzerinde tutulur. Loglar ve basılamayan görseller ise file storage ile saklanır. Daha kalıcı ihtiyaçlarda bu katman SQLite veya PostgreSQL gibi bir veritabanı ile değiştirilebilir.

## Mock Printer Varsayımı

Fiziksel cihaz kullanılmadığı için yazıcı davranışı simüle edilir. Mock adapter:

- `usb` ve `lan` bağlantı modlarını kabul eder.
- Yazdırma komutlarını gerçek cihaza göndermez.
- ESC/POS için gerçek byte üretmek yerine typed command payload oluşturur.
- Kağıt, kapak, sıcaklık ve iletişim hatalarını simüle edebilir.
- Bağlantı kopunca backoff ile otomatik reconnect planlar.

## USB/LAN Adapter Tasarımı

Printer katmanı `PrinterAdapter` arayüzüne bağlıdır:

```ts
interface PrinterAdapter {
  connect(mode: ConnectionMode): Promise<ConnectionInfo>;
  send(command: PrinterCommandPayload): Promise<PrinterAdapterResult>;
  getHealth(): PrinterHealth;
}
```

Şu anda `MockPrinterAdapter` kullanılır. Gerçek cihaz entegrasyonunda USB veya LAN adapter bu arayüzü implemente ederek mevcut servis akışına bağlanabilir.

## Endpointler

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| `POST` | `/connect` | USB veya LAN bağlantısı kurar |
| `GET` | `/status` | Bağlantı, kağıt, kapak, sıcaklık, son iş ve kuyruk durumunu döner |
| `POST` | `/print/text` | Metin yazdırır |
| `POST` | `/print/image` | Görsel yazdırır |
| `POST` | `/reprint` | Sadece başarısız job için tekrar bastırır |
| `GET` | `/logs` | JSON logları döner |
| `POST` | `/print/qr` | QR yazdırma simülasyonu yapar |
| `POST` | `/print/receipt` | Fiş formatında yazdırma simülasyonu yapar |
| `GET` | `/logs/export` | Logları CSV olarak indirir |
| `GET` | `/health` | Servis health-check endpointidir |
| `POST` | `/mock/health` | Demo için yazıcı sağlık durumunu değiştirir |
| `POST` | `/mock/disconnect` | Demo için bağlantı kopması simüle eder |

`/mock/*` endpointleri sadece demo ve test amacıyla eklenmiştir. Gerçek cihaz entegrasyonunda bu endpointlerin kapatılması veya yetkilendirilmesi gerekir.

## Curl Örnekleri

Bağlantı kurma:

```bash
curl -X POST http://localhost:3000/connect \
  -H "Content-Type: application/json" \
  -d "{\"mode\":\"usb\"}"
```

Durum sorgulama:

```bash
curl http://localhost:3000/status
```

Örnek `/status` cevabı:

```json
{
  "success": true,
  "data": {
    "connection": {
      "mode": "usb",
      "state": "connected",
      "reconnectAttempts": 0,
      "nextReconnectAt": null,
      "lastConnectedAt": "2026-06-04T12:30:00.000Z"
    },
    "health": {
      "paper": "ok",
      "cover": "closed",
      "temperature": "normal"
    },
    "lastJob": null,
    "queue": {
      "queued": 0,
      "printing": 0,
      "success": 0,
      "failed": 0,
      "total": 0
    }
  }
}
```

Metin yazdırma:

```bash
curl -X POST http://localhost:3000/print/text \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Merhaba ACO\"}"
```

Görsel yazdırma:

```bash
curl -X POST http://localhost:3000/print/image \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\":\"BASE64_IMAGE_DATA\",\"filename\":\"receipt.png\"}"
```

QR yazdırma:

```bash
curl -X POST http://localhost:3000/print/qr \
  -H "Content-Type: application/json" \
  -d "{\"data\":\"https://aco-recycling.example/reward/abc123\"}"
```

Fiş yazdırma. Bu örnek ekteki fiş görselindeki MachineID, ürün kırılımı ve toplam ödül yapısına göre hazırlanmıştır:

```bash
curl -X POST http://localhost:3000/print/receipt \
  -H "Content-Type: application/json" \
  -d "{\"machineId\":\"ACO-TEST-0001-0001\",\"rewardName\":\"Aco Recycling Default Reward\",\"currency\":\"TRY\",\"issuedAt\":\"2025-09-16T16:19:02.000Z\",\"items\":[{\"product\":\"Glass\",\"quantity\":0,\"reward\":0},{\"product\":\"Plastic\",\"quantity\":2,\"reward\":2},{\"product\":\"Metal\",\"quantity\":1,\"reward\":1},{\"product\":\"Tetrapak\",\"quantity\":0,\"reward\":0}],\"qrPayload\":\"ACO-TEST-0001-0001|3.00\"}"
```

## Hata Simülasyonu

Kağıt bitti senaryosu:

```bash
curl -X POST http://localhost:3000/mock/health \
  -H "Content-Type: application/json" \
  -d "{\"paper\":\"out\"}"
```

Kapak açık senaryosu:

```bash
curl -X POST http://localhost:3000/mock/health \
  -H "Content-Type: application/json" \
  -d "{\"cover\":\"open\"}"
```

Direkt hata kodu simülasyonu:

```bash
curl -X POST http://localhost:3000/print/text \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"test\",\"simulateError\":\"PAPER_JAM\"}"
```

Desteklenen hata kodları:

```txt
PAPER_OUT
PAPER_JAM
COVER_OPEN
OVERHEAT
COMM_ERROR
UNKNOWN_COMMAND
```

Bağlantı kopması ve reconnect:

```bash
curl -X POST http://localhost:3000/mock/disconnect
```

Bu istekten sonra servis reconnect/backoff bilgisini loglar ve mock adapter otomatik tekrar bağlanır.

## Reprint Akışı

Reprint sadece başarısız job için çalışır.

1. Önce hata üret:

```bash
curl -X POST http://localhost:3000/print/text \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"retry test\",\"simulateError\":\"PAPER_OUT\"}"
```

2. Dönen response içindeki `data.id` değerini al.

3. Sorunu düzelt:

```bash
curl -X POST http://localhost:3000/mock/health \
  -H "Content-Type: application/json" \
  -d "{\"paper\":\"ok\"}"
```

4. Tekrar bastır:

```bash
curl -X POST http://localhost:3000/reprint \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"JOB_ID\"}"
```

Başarılı job için reprint denenirse servis `400 BAD_REQUEST` döner.

## Loglama ve CSV Export

Tüm başarılı ve başarısız işlemler JSON olarak loglanır. Örnek log formatı:

```json
{
  "ts": "2026-06-04T12:34:56.000Z",
  "op": "print_image",
  "conn": "usb",
  "jobId": "abc123",
  "status": "error",
  "error": {
    "code": "PAPER_OUT",
    "detail": "No paper detected",
    "userMessage": "Printer paper is out. Please insert a new roll."
  }
}
```

JSON logları almak için:

```bash
curl http://localhost:3000/logs
```

CSV export için:

```bash
curl http://localhost:3000/logs/export
```

## Datasheet Notları

Eklerdeki datasheetler ve fiş görseline göre şu varsayımlar kullanıldı:

- Cihaz tarafında USB ve LAN/Ethernet haberleşmesi desteklenebilir.
- ESC/POS uyumlu komut yapısına göre adapter katmanı ayrıldı.
- QR Code ve görsel baskı desteği servis seviyesinde modellendi.
- Kağıt bitti, kağıt sıkışması, kapak açık, sıcaklık ve iletişim hataları simüle edilebilir hale getirildi.
- Fiş örneğinde ACO Recycling başlığı, MachineID, tarih, ürün kırılımı, toplam ödül ve QR alanı baz alındı.

## Kullanılan Teknolojiler

- Node.js
- Express
- TypeScript
- JSON file logging
- Mock printer adapter

## Notlar

Bu servis demo kapsamı için hazırlanmıştır. Gerçek yazıcı bağlantısı yerine mock adapter kullanılır. Gerçek cihaz geldiğinde USB/LAN haberleşmesi `PrinterAdapter` arayüzü üzerinden eklenebilir.
