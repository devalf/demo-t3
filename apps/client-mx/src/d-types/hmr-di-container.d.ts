declare const module: {
  hot?: {
    data?: { diContainer?: DiContainer };
    dispose(callback: (data: { diContainer: DiContainer }) => void): void;
  };
};
