import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class EmailThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const email = this.extractEmailFromValidatedBody(req);

    if (email) {
      return `email-${email}`;
    }

    return req.ip || 'unknown';
  }

  protected async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<string> {
    const { totalHits, limit, timeToBlockExpire } = throttlerLimitDetail;
    const remainingTime = Math.ceil(timeToBlockExpire / 1000);

    return `Too many sign-in attempts for this email address. Please try again in ${remainingTime} seconds. (${totalHits}/${limit})`;
  }

  private extractEmailFromValidatedBody(req: Request): string | null {
    const body = req.body;

    if (body && 'email' in body && typeof body.email === 'string') {
      return body.email;
    }

    return null;
  }
}
