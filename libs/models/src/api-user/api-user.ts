export type ApiUser = {
  id: number;
  name?: string;
  email: string;
  role: string;
  settings: Record<string, unknown>;
  email_verified: boolean;
};
