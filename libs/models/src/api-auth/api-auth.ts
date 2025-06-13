export type ApiCreateUserParams = {
  email: string;
  password: string;
  name?: string;
};

export type ApiAuthSignInParams = {
  email: string;
  password: string;
};

export type Token = string;

export type ApiTokenObject = {
  token: Token;
};

export type ApiAuthResponseError = {
  message: string[];
  error: string;
  statusCode: number;
};
