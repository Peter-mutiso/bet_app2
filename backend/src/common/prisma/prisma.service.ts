import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error(
        'PrismaService: failed to connect to the database. Database-backed routes will fail until DATABASE_URL is configured correctly.',
        err instanceof Error ? err.message : err,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}