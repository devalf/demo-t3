export const TOKEN_CONFIG = {
  ACCESS_TOKEN: {
    MINUTES: 15,
    get SECONDS() {
      return this.MINUTES * 60;
    },
    get MILLISECONDS() {
      return this.SECONDS * 1000;
    },
    get JWT_EXPIRY() {
      return `${this.MINUTES}m`;
    },
  },
  REFRESH_TOKEN: {
    DAYS: 7,
    get HOURS() {
      return this.DAYS * 24;
    },
    get MINUTES() {
      return this.HOURS * 60;
    },
    get SECONDS() {
      return this.MINUTES * 60;
    },
    get MILLISECONDS() {
      return this.SECONDS * 1000;
    },
    get JWT_EXPIRY() {
      return `${this.DAYS}d`;
    },
  },
} as const;
