import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { TradesService } from './trades.service';

import { BuyContractDto } from './dto/buy-contract.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';


@Controller('trades')
export class TradesController {


  constructor(
    private readonly tradesService: TradesService,
  ) {}



  @UseGuards(JwtAuthGuard)
  @Post('buy')
  buy(

    @CurrentUser() user: any,

    @Body() dto: BuyContractDto,

  ) {


    return this.tradesService.createTrade({

      ...dto,

      userId: user.id,

    });


  }






  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(

    @CurrentUser() user: any,

  ) {


    return this.tradesService.history(
      user.id,
    );


  }


}