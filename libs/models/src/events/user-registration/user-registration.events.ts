export type UserRegistrationInitiatedEvent = {
  email: string;
  name?: string;
  userId: string;
  verificationToken: string;
  timestamp: Date;
  expirationMinutes: number;
};

export const USER_REGISTRATION_EVENTS = {
  INITIATED: 'user.registration.initiated',
} as const;

export const EXCHANGES = {
  USER_EVENTS: 'user.events',
} as const;

export const QUEUES = {
  USER_REGISTRATION: 'user.registration',
  EMAIL_SERVICE: 'email.service',
} as const;
