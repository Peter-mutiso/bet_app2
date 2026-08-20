import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async create(data: {
    username: string;
    email: string;
    passwordHash?: string;
    googleId?: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async linkGoogleId(userId: string, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }

  /**
   * Derives a unique username for a new Google signup from their email/name,
   * since Google doesn't provide one and `username` is a unique, required column.
   */
  async generateUniqueUsername(seed: string): Promise<string> {
    const base =
      seed
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20) || 'user';

    let candidate = base;
    let attempt = 0;

    while (await this.findByUsername(candidate)) {
      attempt += 1;
      candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;

      if (attempt > 10) {
        candidate = `${base}${Date.now()}`;
        break;
      }
    }

    return candidate;
  }
}
