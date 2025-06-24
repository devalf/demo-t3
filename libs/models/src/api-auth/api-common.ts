export type ApiDeviceInfo = {
  userAgent: string;
  ip: string;
};

export type ApiDeviceInfoParams = {
  deviceInfo: ApiDeviceInfo;
};

export type ApiJwtPayload = {
  id: number;
  email: string;
  role: string;
};

export type ApiRefreshTokenPayload = {
  userId: number;
  tokenId: string;
  type: 'refresh';
};

export type ApiMessagePayload = {
  message: string;
};
