import { AuthResponse } from '@/types/auth.type';
import api from '.';
import { deleteToken, getToken, saveToken } from '@/storage/securestore/auth.securestore';
import { store } from '@/storage/atom/store';
import { authState, verifiedState } from '@/storage/atom/auth.atom';
import { router } from 'expo-router';
import axios from 'axios';
import { connectSocket, disconnectSocket } from '@/sockets';
import { getFilter } from './card';

export const signup = async (username: string, email: string, password: string): Promise<AuthResponse | any> => {
  try {
    const res = await api.post<AuthResponse>('/v1/auth/register', { username, email, password });

    await saveToken('accessToken', res.data.accessToken);
    await saveToken('refreshToken', res.data.refreshToken);

    const pushToken = await getToken("pushToken")
    if (pushToken) {
      await saveNotificationToken(pushToken);
    }
    store.set(authState, true);
    store.set(verifiedState, res.data.user?.verified || false);

    return res.data;
  } catch (error) {
    // interceptor already shows toast
    console.error('Signup failed:', error);
  }
};

// Login
export const login = async (email: string, password: string): Promise<AuthResponse> => {

  const res = await axios.post<AuthResponse>('https://api.tokrah.app/v1/auth/login', { email, password });

  await saveToken('accessToken', res.data.accessToken);
  await saveToken('refreshToken', res.data.refreshToken);

  const pushToken = await getToken("pushToken")
  if (pushToken) {
    await saveNotificationToken(pushToken)
  }

  connectSocket(res.data.accessToken);
  store.set(authState, true);
  store.set(verifiedState, res.data.user?.verified || false);

  return res.data;
};


export const getAuthUser = async (lastLocation: { latitude: number | undefined; longitude: number | undefined } = { latitude: 0.23, longitude: 0.23 }) => {
  console.log(lastLocation)
  const res = await api.post('/v1/users/me', { lastLocation });
  store.set(verifiedState, res.data.user?.verified || false);
  const verified = store.get(verifiedState);
  if (verified) {
    const accessToken = await getToken('accessToken');
    connectSocket(accessToken as string);
  }

  await getFilter();
  return res.data;
};

export const saveNotificationToken = async (token: string) => {
  const res = await api.post('/v1/push-token', { token });
  return res.data;
};
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const res = await api.post('/v1/refresh-token', { token: refreshToken });
    console.log('secure token: ' + res)
    await saveToken('accessToken', res.data.accessToken);
    await saveToken('refreshToken', res.data.refreshToken);

    return res.data;
  } catch (error: any) {
    console.error('Error refreshing token:', error);

    if (error.response?.status === 401) {
      // If refresh token is invalid, clear tokens and user data
      await deleteToken('accessToken');
      await deleteToken('refreshToken');
    }

    throw error; // Propagate the error
  }


};

export const signOutUser = async () => {
  try {
    console.log("logging out...")
    const refreshToken = await getToken("refreshToken");
    const pushToken = await getToken("pushToken");

    if (refreshToken != null) {
      try {
        // include pushToken only if available
        await api.post("/v1/auth/logout", {
          token: refreshToken,
          ...(pushToken ? { pushToken } : {}),
        });
      } catch (apiErr: any) {
        console.warn("Logout API failed:", apiErr.response?.data || apiErr.message);
        // Continue clearing local tokens even if server call fails
      }
    } else {
      console.warn("No refresh token found locally.");
    }

    // Clear local user data and tokens in parallel
    await Promise.all([
      deleteToken("accessToken"),
      deleteToken("refreshToken"),
      deleteToken("pushToken")
    ]);

    disconnectSocket();

    console.log("User signed out successfully.");
    router.replace('/(auth)')
  } catch (err: any) {
    console.error("Sign out failed:", err.response?.data || err.message);
    // Optionally show a toast or redirect to login
  }
};


export const signOutAllDevices = async () => {
  try {
    const refreshToken = await getToken("refreshToken");
    const pushToken = await getToken("pushToken");

    if (refreshToken) {
      try {
        // include pushToken only if available
        await api.post("/v1/auth/logout-all", {
          token: refreshToken,
          ...(pushToken ? { pushToken } : {}),
        });
      } catch (apiErr: any) {
        console.warn("Logout all devices API failed:", apiErr.response?.data || apiErr.message);
        // Continue clearing local tokens even if server call fails
      }
    } else {
      console.warn("No refresh token found locally.");
    }

    // Clear local user data and tokens in parallel
    await Promise.all([
      deleteToken("pushToken"),
      deleteToken("accessToken"),
      deleteToken("refreshToken")

    ]);

    disconnectSocket();

    console.log("User signed out from all devices successfully.");
  } catch (err: any) {
    console.error("Sign out all devices failed:", err.response?.data || err.message);
    // Optionally show a toast or redirect to login
  }
};

export const updateUserInfo = async ({username, name, bio, emailCode, email, birthdate, height, gender,currentPassword, password}:{username?: string, name?: string, bio?: string, emailCode?: string, email?: string, birthdate?: string|null, height?: number, gender?: number, currentPassword?: string, password?: string}) => {
  const updateData: any = {};
  if (username) updateData.username = username;
  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (email) updateData.email = email;
  // ensure birthdate is a Date if provided
  if (birthdate) updateData.birthdate = birthdate;
  if (height !== undefined) updateData.height = height;
  // cast gender to any so it conforms to the generated Prisma enum/update input shape
  if (gender !== undefined) updateData.gender = gender as any;
  if (password) updateData.password = password;
  if (emailCode) updateData.emailCode = emailCode;
  if (currentPassword) updateData.currentPassword = currentPassword;

  try {
    api.patch("/v1/users/me", updateData)
  } catch (error) {
    console.log(error)
  }

}