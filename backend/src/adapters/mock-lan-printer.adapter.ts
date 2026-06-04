import { MockPrinterAdapter } from "./mock-printer.adapter";

export class MockLanPrinterAdapter extends MockPrinterAdapter {
  constructor() {
    super("lan");
  }
}
