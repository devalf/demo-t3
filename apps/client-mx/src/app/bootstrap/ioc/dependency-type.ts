export const DependencyType = {
  StoreExampleOne: Symbol.for('StoreExampleOne'),
  StoreExampleTwo: Symbol.for('StoreExampleTwo'),
  CartManager: Symbol.for('CartManager'),
  ModalManager: Symbol.for('ModalManager'),
  UserManager: Symbol.for('UserManager'),
  ToastManager: Symbol.for('ToastManager'),
  RefreshTokenManager: Symbol.for('RefreshTokenManager'),
} as const;
