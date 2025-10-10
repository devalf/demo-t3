export type ApiSendVerificationEmailParams = {
  to: string;
  name?: string;
  verificationToken: string;
  expirationMinutes: number;
};
