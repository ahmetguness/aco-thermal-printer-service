import { MockLanPrinterAdapter } from "./mock-lan-printer.adapter";
import type { BaseMockPrinterAdapter } from "./mock-printer.adapter";
import { MockUsbPrinterAdapter } from "./mock-usb-printer.adapter";
import type { ConnectionMode } from "../types/printer.types";

export class MockPrinterAdapterRegistry {
  private readonly adapters: Record<ConnectionMode, BaseMockPrinterAdapter> = {
    usb: new MockUsbPrinterAdapter(),
    lan: new MockLanPrinterAdapter(),
  };

  get(mode: ConnectionMode): BaseMockPrinterAdapter {
    return this.adapters[mode];
  }
}

export const mockPrinterAdapterRegistry = new MockPrinterAdapterRegistry();
