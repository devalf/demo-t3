import axios from 'axios';

const getCsrfTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find((cookie) => cookie.startsWith('csrfToken='));

  return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
};

export const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();

    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCsrfTokenFromCookie();

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
