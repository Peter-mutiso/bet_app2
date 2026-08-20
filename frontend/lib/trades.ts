import { api } from "./api";

export interface BuyTradeDto {
  symbol: string;
  contractType: string;
  prediction?: number | null;
  barrier?: number | null;
  tickDuration: number;
  stake: number;
}

export interface TradeResponse {
  id: string;
  symbol: string;
  contractType: string;
  prediction?: number | null;
  barrier?: number | null;
  tickDuration: number;
  entryPrice: number;
  stake: number;
  payout: number;
  status: "OPEN" | "WON" | "LOST";
  createdAt?: string;
}

/**
 * Executes a new trade order against the backend
 * Strips null/undefined values to ensure API compatibility
 */
export async function buyTrade(dto: BuyTradeDto): Promise<TradeResponse> {
  // Clean payload: Remove null or undefined fields
  const payload: any = {
    symbol: dto.symbol,
    contractType: dto.contractType,
    tickDuration: Number(dto.tickDuration),
    stake: Number(dto.stake),
  };

  // Only include optional fields if they have a value
  if (dto.prediction !== undefined && dto.prediction !== null) {
    payload.prediction = dto.prediction;
  }
  if (dto.barrier !== undefined && dto.barrier !== null) {
    payload.barrier = dto.barrier;
  }

  return api<TradeResponse>("/trades/buy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// ... existing getOpenTrades, getTradeHistory, getTradeById remain unchanged