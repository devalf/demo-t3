import { AxiosRequestConfig } from 'axios';

export type AppAuthRequestingOptions = {
  skipAuthRefresh: boolean;
};

export type AppAuthAxiosRequestConfig = AxiosRequestConfig &
  AppAuthRequestingOptions;
