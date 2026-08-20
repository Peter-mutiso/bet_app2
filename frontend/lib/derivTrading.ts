// lib/derivTrading.ts

export interface TradeParams {
  symbol: string;
  contractType: "EVEN" | "ODD";
  stake: number;
  duration?: number;
  apiToken?: string;
}

export interface DerivBuyResponse {
  buy_price: number;
  contract_id: number;
  longcode: string;
  payout: number;
  purchase_time: number;
  shortcode: string;
  start_time: number;
  transaction_id: number;
}

export async function executeDerivTrade({
  symbol,
  contractType,
  stake,
  duration = 1,
  apiToken,
}: TradeParams): Promise<DerivBuyResponse> {
  // 1. Resolve and sanitize API Token (explicit token OR process.env fallback)
  const resolvedToken = (
    apiToken ||
    process.env.NEXT_PUBLIC_DERIV_API_TOKEN ||
    ""
  ).trim();

  // 2. Pre-flight token validation check
  if (
    !resolvedToken ||
    resolvedToken === "" ||
    resolvedToken === "YOUR_DERIV_API_TOKEN"
  ) {
    throw new Error(
      "Deriv API Token missing or invalid! Please set NEXT_PUBLIC_DERIV_API_TOKEN in your .env.local file and restart your dev server."
    );
  }

  return new Promise((resolve, reject) => {
    let isSettled = false;

    // Use standard App ID 1089 or custom env App ID
    const appId = process.env.NEXT_PUBLIC_DERIV_APP_ID || "1089";
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);

    // Helper to safely reject promise and close socket
    const safeReject = (error: Error) => {
      if (!isSettled) {
        isSettled = true;
        try {
          if (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
          ) {
            ws.close();
          }
        } catch (_) {}
        reject(error);
      }
    };

    // Helper to safely resolve promise and close socket
    const safeResolve = (data: DerivBuyResponse) => {
      if (!isSettled) {
        isSettled = true;
        try {
          if (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
          ) {
            ws.close();
          }
        } catch (_) {}
        resolve(data);
      }
    };

    ws.onopen = () => {
      // Step 1: Send token authorization
      ws.send(
        JSON.stringify({
          authorize: resolvedToken,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Step 2: Handle Authorization Response
        if (data.msg_type === "authorize") {
          if (data.error) {
            return safeReject(
              new Error(
                `Auth Failed: ${
                  data.error.message || "Invalid or expired API token."
                }`
              )
            );
          }

          const derivContractType =
            contractType === "EVEN" ? "DIGITEVEN" : "DIGITODD";

          // Step 3: Place real contract buy request
          ws.send(
            JSON.stringify({
              buy: 1,
              price: stake,
              parameters: {
                amount: stake,
                basis: "stake",
                contract_type: derivContractType,
                currency: data.authorize.currency || "USD",
                duration: duration,
                duration_unit: "t",
                symbol: symbol,
              },
            })
          );
        }

        // Step 4: Handle Contract Execution Response
        if (data.msg_type === "buy") {
          if (data.error) {
            return safeReject(
              new Error(
                `Trade Failed: ${
                  data.error.message || "Failed to execute contract."
                }`
              )
            );
          }

          safeResolve(data.buy);
        }
      } catch (err: any) {
        safeReject(
          new Error(`Failed to parse WebSocket message: ${err.message}`)
        );
      }
    };

    ws.onerror = () => {
      safeReject(
        new Error(
          "WebSocket network connection failed. Check internet connection or Deriv status."
        )
      );
    };

    ws.onclose = (event) => {
      if (!isSettled) {
        safeReject(
          new Error(
            `WebSocket closed unexpectedly before trade completed (Code: ${event.code}).`
          )
        );
      }
    };
  });
}