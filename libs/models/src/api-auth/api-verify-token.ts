export type ApiVerifyToken = {
  isValid: boolean;
  payload?: Record<string, unknown>;
  error?: string;
};
