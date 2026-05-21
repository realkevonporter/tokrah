// lib/api.ts

import axios from 'axios';
import Toast from 'react-native-toast-message';

import { getToken, saveToken } from '@/storage/securestore/auth.securestore';
import { signOutUser } from './auth';

let API_URL;

if (__DEV__) {
  API_URL = 'http://10.0.0.226:5000';
} else {
  API_URL = 'https://api.tokrah.app';
}

const api = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// ---------------- REQUEST INTERCEPTOR ----------------

api.interceptors.request.use(async (config) => {
  const token = await getToken('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- RESPONSE INTERCEPTOR ----------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Skip if no response
    if (!error.response) {
      showError(error);
      return Promise.reject(error);
    }

    // ---------------- HANDLE 401 ----------------

    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If already refreshing, queue requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization =
              `Bearer ${token}`;

            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await getToken('refreshToken');

        if (!refreshToken) {
          await signOutUser();
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${API_URL}/v1/refresh-token`,
          {
            token: refreshToken,
          }
        );

        await saveToken('accessToken', data.accessToken);
        await saveToken('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        await signOutUser();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ---------------- OTHER ERRORS ----------------

    showError(error);

    return Promise.reject(error);
  }
);

// ---------------- ERROR HANDLER ----------------

function showError(error: any) {
  let message =
    'Something went wrong. Please try again.';

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (!data) {
      message = error.message || message;
    } else if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    } else if (
      data.errors &&
      Array.isArray(data.errors)
    ) {
      message = data.errors
        .map((e: any) => e.msg || e.message)
        .join('\n');
    }
  } else if (error?.message) {
    message = error.message;
  }

  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  });
}

export default api;