import { BaseMockPrinterAdapter } from "./mock-printer.adapter";

export class MockLanPrinterAdapter extends BaseMockPrinterAdapter {
  constructor() {
    super("lan");
  }
}
