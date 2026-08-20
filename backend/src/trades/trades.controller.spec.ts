import {
    Body,
    Controller,
    Post,
} from "@nestjs/common";

import { TradesService } from "./trades.service";
import { CreateTradeDto } from "./dto/create-trade.dto";

@Controller("trades")
export class TradesController {

    constructor(
        private readonly tradesService: TradesService,
    ) {}

    @Post()

    create(

        @Body() dto: CreateTradeDto,

    ) {

        return this.tradesService.createTrade(dto);

    }

}