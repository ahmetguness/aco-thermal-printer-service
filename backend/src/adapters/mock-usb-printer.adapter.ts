import { MockPrinterAdapter } from "./mock-printer.adapter";

export class MockUsbPrinterAdapter extends MockPrinterAdapter {
  constructor() {
    super("usb");
  }
}
