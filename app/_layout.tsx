import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Provider, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { store } from '@/storage/atom/store';
import AppLayout from './(app)/_layout';
import { authState, authUserAtom, verifiedState } from '@/storage/atom/auth.atom';
import VerifyScreen from './(auth)/verify';
import AuthScreen from './(auth)';
import { deleteToken, getToken } from '@/storage/securestore/auth.securestore';
import { getAuthUser } from '@/api/auth';
import { useEffect, useState } from 'react';
import BottomSheet, { BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetProvider } from '@/bottomsheet/BottomSheetProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { User } from '@/types/user.type';
import { authLocationAtom } from '@/storage/atom/location.atom';
import { Text, View } from 'react-native';
import { setSupabaseAuth, supabase } from '@/storage/supabase';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  SplashScreen.preventAutoHideAsync();

  const authenticated = useAtomValue(authState);
  const verified = useAtomValue(verifiedState);
  const [authUser, setAuthUser] = useAtom(authUserAtom)

  const [location, setLocation] = useAtom(authLocationAtom);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getCurrentLocationasync = async ()=>{
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

const verifyAccount = async () => {

  try {
    await getCurrentLocationasync();

    const accessToken = await getToken('accessToken');

    if (!accessToken) return;

    store.set(authState, true);

    const latitude = location?.coords?.latitude;
    const longitude = location?.coords?.longitude;

    const coords = {
      latitude,
      longitude,
    };

    console.log('location x:', latitude);

    const res = await getAuthUser(coords);

    let address = null;

    if (location?.coords) {
      const [reverseAddress] =
        await Location.reverseGeocodeAsync(location.coords);

      address = reverseAddress;

      console.log('reverse geocode:', reverseAddress);
    }

    const updatedUser = {
      ...res.user,
      address,
    };

    setAuthUser(updatedUser);

    console.log(
      'User verified status:',
      updatedUser?.verified
    );
  } catch (error) {
    console.log(error);
  }
};
  useEffect(() => {
    verifyAccount();
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 1000);
  }, [authenticated, verified]);

async function testConnection() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)

  console.log({ data, error })
}

useEffect(()=>{
testConnection();
},[])



  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <BottomSheetProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {authenticated && authUser?.verified ? <AppLayout /> : authenticated && !authUser?.verified ? <VerifyScreen /> : <AuthScreen />}
            <StatusBar style="auto" />
          </ThemeProvider>
        </BottomSheetProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}