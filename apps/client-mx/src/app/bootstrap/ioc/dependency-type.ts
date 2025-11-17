export const DependencyType = {
  CartManager: Symbol.for('CartManager'),
  ModalManager: Symbol.for('ModalManager'),
  UserManager: Symbol.for('UserManager'),
  ToastManager: Symbol.for('ToastManager'),
  RefreshTokenManager: Symbol.for('RefreshTokenManager'),
  AuthInterceptorService: Symbol.for('AuthInterceptorService'),
} as const;
