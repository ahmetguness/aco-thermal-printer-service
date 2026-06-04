import { BaseMockPrinterAdapter } from "./mock-printer.adapter";

export class MockUsbPrinterAdapter extends BaseMockPrinterAdapter {
  constructor() {
    super("usb");
  }
}
