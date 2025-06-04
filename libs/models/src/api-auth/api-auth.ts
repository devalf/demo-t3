export type ApiAuthParams = {
  email: string;
  password: string;
  name?: string;
};

export type Token = string;

export type ApiTokenObject = {
  token: Token;
};
