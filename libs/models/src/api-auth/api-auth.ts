export type ApiCreateUserParams = {
  email: string;
  password: string;
  name?: string;
};

export type ApiAuthSignInParams = {
  email: string;
  password: string;
};

export type ApiAuthResponseError = {
  message: string | string[];
  error?: string;
  statusCode: number;
  errorCode?: string;
};

export type ApiVerifyEmailParams = {
  token: string;
};

export type ApiUpdateUserBasicParams = {
  email?: string;
  name?: string;
  email_verified?: boolean;
};

export type ApiUpdateUserParams = ApiUpdateUserBasicParams & {
  targetUserId: number;
  accessToken: string;
};
