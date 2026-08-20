export class TradeEngine {

    settle(trade: any, currentTick: any) {

        const lastDigit = currentTick.digit;

        let won = false;

        switch (trade.contractType) {

            case "DIGITMATCH":

                won = lastDigit === trade.barrier;
                break;

            case "DIGITDIFFERS":

                won = lastDigit !== trade.barrier;
                break;

            case "OVER":

                won = lastDigit > trade.barrier;
                break;

            case "UNDER":

                won = lastDigit < trade.barrier;
                break;

            case "EVEN":

                won = lastDigit % 2 === 0;
                break;

            case "ODD":

                won = lastDigit % 2 !== 0;
                break;

        }

        return {

            status: won ? "WON" : "LOST",

            won,

            exitDigit: lastDigit,

            exitPrice: currentTick.price,

            settledAt: new Date(),

        };

    }

}