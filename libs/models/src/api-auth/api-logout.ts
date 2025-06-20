export type ApiLogoutResponse = {
  message: string;
  timestamp: string;
};

export type ApiLogoutAllResponse = {
  message: string;
  devicesLoggedOut?: number;
  timestamp: string;
};
