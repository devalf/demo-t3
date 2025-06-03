import { ApiUser } from '../api-user';

export type ApiAuthParams = {
  email: string;
  password: string;
  name?: string;
};

export type ApiSignUpResponse = {
  token: string;
  user: ApiUser;
};

export type ApiSignInResponse = {
  token: string;
};
