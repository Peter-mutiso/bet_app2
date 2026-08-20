import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string) {
    return this.prisma.wallet.create({
      data: {
        userId,
        balance: new Prisma.Decimal(10000),
        currency: 'KES',
      },
    });
  }

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async credit(
    userId: string,
    amount: number,
    description: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: new Prisma.Decimal(amount),
          type: 'BONUS',
          description,
        },
      });

      return updatedWallet;
    });
  }

  async debit(
    userId: string,
    amount: number,
    description: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException(
        'Insufficient balance',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: new Prisma.Decimal(amount),
          type: 'WITHDRAWAL',
          description,
        },
      });

      return updatedWallet;
    });
  }

  async history(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.walletTransaction.findMany({
      where: {
        walletId: wallet.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}