interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    detail?: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

interface ConnectionInfo {
  mode: "usb" | "lan" | null;
  state: "disconnected" | "connecting" | "connected" | "reconnecting";
}

interface PrintJob {
  id: string;
  status: "queued" | "printing" | "success" | "failed";
  error?: {
    code: string;
  };
}

interface LogEntry {
  ts: string;
  op: string;
  status: string;
}

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

async function main(): Promise<void> {
  await check("GET /health", async () => {
    const response = await getJson<{ status: "ok" }>("/health");
    assertSuccess(response);
    assert(response.data.status === "ok", "Health status should be ok");
  });

  await check("POST /connect", async () => {
    const response = await postJson<ConnectionInfo>("/connect", { mode: "usb" });
    assertSuccess(response);
    assert(response.data.state === "connected", "Connection state should be connected");
  });

  const textJob = await check("POST /print/text", async () => {
    const response = await postJson<PrintJob>("/print/text", { text: "Smoke test" });
    assertSuccess(response);
    assert(response.data.status === "success", "Text job should succeed");
    return response.data;
  });

  await check("POST /reprint rejects successful job", async () => {
    const response = await postJson<PrintJob>("/reprint", { jobId: textJob.id }, 400);
    assertFailure(response);
    assert(response.error.code === "BAD_REQUEST", "Successful job reprint should be rejected");
  });

  const failedJob = await check("POST /print/image with PAPER_OUT", async () => {
    await postJson("/mock/health", { paper: "out" });
    const response = await postJson<PrintJob>("/print/image", {
      imageBase64: "BASE64_IMAGE_DATA",
      filename: "receipt.png",
    });
    assertSuccess(response);
    assert(response.data.status === "failed", "Image job should fail");
    assert(response.data.error?.code === "PAPER_OUT", "Image job should fail with PAPER_OUT");
    await postJson("/mock/health", { paper: "ok" });
    return response.data;
  });

  await check("POST /reprint failed job", async () => {
    const response = await postJson<PrintJob>("/reprint", { jobId: failedJob.id });
    assertSuccess(response);
    assert(response.data.status === "success", "Failed job reprint should succeed");
  });

  await check("GET /logs", async () => {
    const response = await getJson<LogEntry[]>("/logs");
    assertSuccess(response);
    assert(response.data.length > 0, "Logs should not be empty");
  });

  await check("GET /logs/export", async () => {
    const response = await fetch(`${baseUrl}/logs/export`);
    assert(response.ok, "CSV export should return 2xx");
    const csv = await response.text();
    assert(csv.startsWith("ts,op,conn,jobId,status,message,errorCode,errorDetail,errorUserMessage"), "CSV header mismatch");
  });

  console.log("Smoke test passed");
}

async function getJson<TData>(path: string): Promise<ApiResponse<TData>> {
  const response = await fetch(`${baseUrl}${path}`);
  return parseApiResponse<TData>(response);
}

async function postJson<TData>(
  path: string,
  body: Record<string, unknown>,
  expectedStatus = 200,
): Promise<ApiResponse<TData>> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  assert(response.status === expectedStatus, `${path} returned ${response.status}, expected ${expectedStatus}`);
  return parseApiResponse<TData>(response);
}

async function parseApiResponse<TData>(response: Response): Promise<ApiResponse<TData>> {
  const parsed: unknown = await response.json();

  if (!isApiResponse<TData>(parsed)) {
    throw new Error("Invalid API response shape");
  }

  return parsed;
}

function isApiResponse<TData>(value: unknown): value is ApiResponse<TData> {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }

  if (value.success === true) {
    return "data" in value;
  }

  return isRecord(value.error) && typeof value.error.code === "string" && typeof value.error.message === "string";
}

function assertSuccess<TData>(response: ApiResponse<TData>): asserts response is ApiSuccess<TData> {
  assert(response.success, response.success ? "Expected success response" : response.error.message);
}

function assertFailure<TData>(response: ApiResponse<TData>): asserts response is ApiFailure {
  assert(!response.success, "Expected failure response");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function check<T>(label: string, run: () => Promise<T>): Promise<T> {
  try {
    const result = await run();
    console.log(`[ok] ${label}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[fail] ${label}: ${message}`);
    throw error;
  }
}

void main().catch(() => {
  process.exitCode = 1;
});
