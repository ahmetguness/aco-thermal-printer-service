const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim();
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ""}/api`;
  }

  return "http://localhost:3000";
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ACCESS_TOKEN =
  import.meta.env.VITE_API_ACCESS_TOKEN?.trim() || "test-token-1234";

