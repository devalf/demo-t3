export type ApiVerifyToken = {
  isValid: boolean;
  payload?: Record<string, unknown>;
  error?: string;
};

export type Token = string;

export type ApiTokenObject = {
  token: Token;
};

export type ApiRefreshTokenObject = {
  refreshToken: Token;
};

// we need this type to simplify handling response in case of error
export type ApiTokenResponse = ApiTokenObject & {
  message?: string;
};

export type ApiAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
