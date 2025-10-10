import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  USER_REGISTRATION_EVENTS,
  UserRegistrationInitiatedEvent,
} from '@demo-t3/models';

import { EmailService } from '../email';

@Controller()
export class RegistrationEventsController {
  private readonly logger = new Logger(RegistrationEventsController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern(USER_REGISTRATION_EVENTS.INITIATED)
  async handleUserRegistrationInitiated(
    @Payload() data: UserRegistrationInitiatedEvent,
    @Ctx() context: RmqContext
  ) {
    try {
      await this.emailService.sendVerificationEmail({
        to: data.email,
        name: data.name,
        verificationToken: data.verificationToken,
        expirationMinutes: data.expirationMinutes,
      });

      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to process registration event for ${data.email}`,
        error
      );

      // Reject and requeue the message for retry
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      channel.nack(originalMsg, false, true);
    }
  }
}
