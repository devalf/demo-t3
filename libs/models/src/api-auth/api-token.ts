export type ApiVerifyToken = {
  isValid: boolean;
  payload?: Record<string, unknown>;
  error?: string;
};

export type Token = string;

export type ApiAccessToken = {
  accessToken: Token;
};

export type ApiRefreshTokenObject = {
  refreshToken: Token;
};

export type ApiTokenResponse = ApiAuthTokens & {
  message?: string;
};

export type ApiAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
