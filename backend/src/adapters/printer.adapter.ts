import type {
  ConnectionInfo,
  ConnectionMode,
  PrinterCommandPayload,
  PrinterError,
  PrinterHealth,
} from "../types/printer.types";

export type PrinterAdapterResult =
  | {
      success: true;
      message: string;
      command: PrinterCommandPayload;
    }
  | {
      success: false;
      error: PrinterError;
      command: PrinterCommandPayload;
    };

export interface PrinterAdapter {
  readonly mode: ConnectionMode;
  connect(): Promise<ConnectionInfo>;
  send(command: PrinterCommandPayload): Promise<PrinterAdapterResult>;
  getHealth(): PrinterHealth;
}

export interface ReconnectSchedule {
  connection: ConnectionInfo;
  delayMs: number;
}
