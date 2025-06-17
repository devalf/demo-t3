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

// we need this type to simplify handling response in case of error
export type ApiTokenResponse = ApiTokenObject & {
  message?: string;
};

export type ApiAuthResponseError = {
  message: string[];
  error: string;
  statusCode: number;
};
