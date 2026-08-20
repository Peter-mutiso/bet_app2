import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TradesService } from '../trades/trades.service';
import { MarketService } from '../market/market.service'; // Assuming you have this

@Injectable()
export class AiScannerService {
  private readonly logger = new Logger(AiScannerService.name);

  constructor(
    private readonly tradesService: TradesService,
    private readonly marketService: MarketService,
  ) {}

  // Scan every 30 seconds
  @Interval(30000)
  async handleScan() {
    this.logger.log('Starting AI Market Scan...');

    try {
      // 1. Get all available markets
      const markets = await this.marketService.getAvailableMarkets();

      // 2. Select the "Best" one
      // Replace this logic with your actual AI/Strategy signal
      const bestMarket = this.selectBestMarket(markets);

      if (!bestMarket) {
        this.logger.log('No suitable trading opportunity found.');
        return;
      }

      this.logger.log(`Best Market Identified: ${bestMarket.symbol}`);

      // 3. Execute Trade
      // Note: You may need a userId or specific context here
      const result = await this.tradesService.createTrade({
        symbol: bestMarket.symbol,
        type: 'BUY', 
        amount: 100, // Example size
      });

      this.logger.log(`Trade executed successfully: ${JSON.stringify(result)}`);
      
    } catch (error) {
      this.logger.error('AI Scanner failed:', error);
    }
  }

  private selectBestMarket(markets: any[]) {
    // SIMPLE AI LOGIC: Pick the market with the highest 24h change
    // Replace this with your ML prediction or technical indicators
    if (!markets || markets.length === 0) return null;

    return markets.reduce((prev, current) => {
      return (current.priceChangePercent > prev.priceChangePercent) ? current : prev;
    });
  }
}