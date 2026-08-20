// app/api/trade/route.ts
import { NextResponse } from "next/server";
import WebSocket from "ws";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symbol, contractType, stake, duration = 1, apiToken } = body;

    // 1. Resolve token: client payload token OR server process.env fallback
    let rawToken = apiToken || process.env.DERIV_API_TOKEN || "";
    
    // Clean string (strip accidental quotes/whitespace)
    const serverToken = rawToken.replace(/^["']|["']$/g, "").trim();
    const appId = process.env.DERIV_APP_ID || "1089";

    // 2. Debug log in your terminal running `npm run dev`
    console.log("📡 Server API Trade Attempt:", {
      symbol,
      contractType,
      tokenLength: serverToken.length,
      tokenPreview: serverToken ? `${serverToken.substring(0, 4)}...` : "MISSING",
      appId,
    });

    if (!serverToken) {
      return NextResponse.json(
        {
          error:
            "Deriv API Token is missing. Please enter a valid token in the app or set DERIV_API_TOKEN in .env.local",
        },
        { status: 400 }
      );
    }

    // 3. Connect to Deriv WebSocket
    const tradeResult = await new Promise((resolve, reject) => {
      const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);

      let isSettled = false;
      const cleanupAndReject = (errMessage: string) => {
        if (!isSettled) {
          isSettled = true;
          if (ws.readyState === WebSocket.OPEN) ws.close();
          reject(new Error(errMessage));
        }
      };

      ws.on("open", () => {
        ws.send(JSON.stringify({ authorize: serverToken }));
      });

      ws.on("message", (rawMessage: WebSocket.RawData) => {
        try {
          const data = JSON.parse(rawMessage.toString());

          // Step A: Handle Auth
          if (data.msg_type === "authorize") {
            if (data.error) {
              return cleanupAndReject(
                `Backend Auth Failed [${data.error.code}]: ${data.error.message}`
              );
            }

            const derivContractType =
              contractType === "EVEN" ? "DIGITEVEN" : "DIGITODD";

            // Step B: Send Buy Request
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

          // Step C: Handle Buy Result
          if (data.msg_type === "buy") {
            if (data.error) {
              return cleanupAndReject(`Trade Execution Failed: ${data.error.message}`);
            }

            if (!isSettled) {
              isSettled = true;
              ws.close();
              resolve(data.buy);
            }
          }
        } catch (err: any) {
          cleanupAndReject(`Message parse error: ${err.message}`);
        }
      });

      ws.on("error", (err) => {
        cleanupAndReject(`Server WebSocket connection error: ${err.message}`);
      });
    });

    return NextResponse.json({ success: true, data: tradeResult });
  } catch (error: any) {
    console.error("❌ Trade API Route Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal server trade error" },
      { status: 400 }
    );
  }
}