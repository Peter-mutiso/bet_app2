import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

let socket: Socket | null = null;

export interface TickData {
  symbol: string;
  quote: number;
  digit: number;
  timestamp: number;
}

function getAuthToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export function getSocket(): Socket {
  // Never create a socket during SSR.
  if (typeof window === "undefined") {
    return {} as Socket;
  }

  const token = getAuthToken();

  // Create the socket only once.
  if (!socket) {
    console.log("[Socket] Initializing connection:", SOCKET_URL);

    socket = io(SOCKET_URL, {
      // Socket.IO should establish the initial connection through
      // HTTP polling and then upgrade to WebSocket when available.
      transports: ["polling", "websocket"],

      autoConnect: true,

      // Authentication sent during the Socket.IO handshake.
      auth: {
        token,
      },

      // Required when the backend allows credentialed CORS requests.
      withCredentials: true,

      // Automatically reconnect when the connection drops.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,

      // Connection timeout.
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected successfully:", socket?.id);
      console.log("[Socket] Transport:", socket?.io.engine.transport.name);
    });

    socket.on("connect_error", (err: Error & { description?: unknown; context?: unknown }) => {
      console.error("[Socket] Connection error:", {
        message: err.message,
        description: err.description,
        context: err.context,
        url: SOCKET_URL,
      });
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`[Socket] Reconnection attempt #${attempt}`);
    });

    socket.io.on("reconnect", (attempt) => {
      console.log(
        `[Socket] Reconnected successfully after ${attempt} attempt(s)`
      );
    });

    socket.io.on("reconnect_error", (err) => {
      console.error("[Socket] Reconnection error:", err.message);
    });

    socket.io.on("reconnect_failed", () => {
      console.error("[Socket] Reconnection failed.");
    });

    // Log when polling upgrades to WebSocket.
    socket.io.engine.on("upgrade", (transport) => {
      console.log("[Socket] Transport upgraded to:", transport.name);
    });
  } else {
    // Refresh the authentication token for an existing socket.
    socket.auth = {
      token,
    };

    // If the socket isn't connected, reconnect it.
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
  }

  return socket;
}

export function subscribeTicks(symbol: string): void {
  const s = getSocket();

  if (!s || typeof s.once !== "function") {
    return;
  }

  const subscribe = () => {
    console.log(`[Socket] Subscribing to ticks: ${symbol}`);
    s.emit("subscribeTicks", { symbol });
  };

  if (s.connected) {
    subscribe();
  } else {
    s.once("connect", subscribe);
  }
}

export function unsubscribeTicks(symbol: string): void {
  const s = getSocket();

  if (!s || typeof s.emit !== "function") {
    return;
  }

  console.log(`[Socket] Unsubscribing from ticks: ${symbol}`);
  s.emit("unsubscribeTicks", { symbol });
}

export function disconnectSocket(): void {
  if (socket) {
    console.log("[Socket] Disconnecting...");
    socket.disconnect();
  }
}

export function resetSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}