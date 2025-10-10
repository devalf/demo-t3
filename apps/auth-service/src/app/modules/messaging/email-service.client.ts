import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  USER_REGISTRATION_EVENTS,
  UserRegistrationInitiatedEvent,
} from '@demo-t3/models';

@Injectable()
export class EmailServiceClient {
  constructor(@Inject('EMAIL_SERVICE') private readonly client: ClientProxy) {}

  emitUserRegistrationInitiated(event: UserRegistrationInitiatedEvent): void {
    this.client.emit(USER_REGISTRATION_EVENTS.INITIATED, event);
  }
}
