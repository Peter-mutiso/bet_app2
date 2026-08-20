import {
  Body,
  Controller,
 Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { WalletService } from './wallet.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {

  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get()
  getWallet(
    @CurrentUser() user: any,
  ) {

    return this.walletService.getWallet(
      user.id,
    );

  }

  @Patch('deposit')
  deposit(
    @CurrentUser() user: any,
    @Body() dto: DepositDto,
  ) {

    return this.walletService.credit(
      user.id,
      dto.amount,
      'Demo Deposit',
    );

  }

  @Patch('withdraw')
  withdraw(
    @CurrentUser() user: any,
    @Body() dto: WithdrawDto,
  ) {

    return this.walletService.debit(
      user.id,
      dto.amount,
      'Demo Withdraw',
    );

  }

}