import { apiClient } from "@/lib/api";

export type StreamEvent = {
  event: string;
  data: any;
};

interface MultiStreamParams {
  message: string;
  conversation_id?: string;
  automation_level?: 1 | 2 | 3;
  signal?: AbortSignal;
  onEvent?: (ev: StreamEvent) => void;
}

// POST streaming via fetch to parse text/event-stream manually
export async function startMultiAgentStream({
  message,
  conversation_id,
  automation_level,
  signal,
  onEvent,
}: MultiStreamParams): Promise<void> {
  const baseURL = (apiClient.defaults.baseURL || "").replace(/\/$/, "");
  const url = `${baseURL}/api/v1/chat/multi-stream`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  // ngrok free plan warning bypass
  if (/ngrok/.test(baseURL)) {
    headers["ngrok-skip-browser-warning"] = "true";
  }
  // Carry auth header if present in axios client
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      conversation_id,
      automation_level,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream HTTP error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const flushSSE = (chunk: string) => {
    // Parse SSE messages: separated by double newlines
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const lines = raw.split(/\r?\n/);
      let event = "message";
      let dataStr = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const part = line.slice(5).trim();
          dataStr += part;
        }
      }
      if (dataStr === "[DONE]" || event === "done") {
        onEvent?.({ event: "done", data: null });
        continue;
      }
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          onEvent?.({ event, data });
        } catch {
          onEvent?.({ event, data: dataStr });
        }
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    flushSSE(decoder.decode(value, { stream: true }));
  }
  // Flush any trailing buffer
  if (buffer.trim().length > 0) flushSSE("\n\n");
}
