export interface Tick {

    symbol: string;

    price: number;

    digit: number;

    timestamp: number;

}

export interface Candle {

    time: number;

    open: number;

    high: number;

    low: number;

    close: number;

}