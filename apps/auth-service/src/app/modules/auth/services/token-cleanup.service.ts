import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every day at 2 AM
  @Cron('0 2 * * *')
  async dailyCleanup() {
    this.logger.log('Starting daily token cleanup...');

    try {
      await this.cleanupExpiredTokens();
    } catch (error) {
      this.logger.error(`Daily cleanup failed: ${error.message}`);
    }
  }

  // Run every Sunday at 3 AM for deeper cleanup
  @Cron('0 3 * * 0')
  async weeklyDeepCleanup() {
    this.logger.log('Starting weekly deep cleanup...');

    try {
      await this.cleanupExpiredTokens();

      await this.cleanupUnusedTokens(30);

      await this.cleanupOrphanedTokens();
    } catch (error) {
      this.logger.error(`Weekly cleanup failed: ${error.message}`);
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    try {
      const batchSize = 1000;
      let totalDeleted = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await this.prisma.refreshToken.deleteMany({
          where: {
            expires_at: {
              lt: new Date(),
            },
          },
        });

        totalDeleted += result.count;
        hasMore = result.count === batchSize;

        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return totalDeleted;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`);

      throw error;
    }
  }

  async cleanupUnusedTokens(daysOld: number): Promise<number> {
    try {
      const cutoffDate = new Date();

      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            {
              last_used_at: {
                lt: cutoffDate,
              },
            },
            {
              last_used_at: null,
              created_at: {
                lt: cutoffDate,
              },
            },
          ],
          expires_at: {
            gt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cleanup unused tokens: ${error.message}`);
      throw error;
    }
  }

  async cleanupOrphanedTokens(): Promise<number> {
    try {
      const orphanedTokens = await this.prisma.refreshToken.findMany({
        where: {
          user: null,
        },
        select: {
          id: true,
        },
      });

      if (orphanedTokens.length === 0) {
        return 0;
      }

      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          id: {
            in: orphanedTokens.map((token) => token.id),
          },
        },
      });

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cleanup orphaned tokens: ${error.message}`);
      throw error;
    }
  }
}
