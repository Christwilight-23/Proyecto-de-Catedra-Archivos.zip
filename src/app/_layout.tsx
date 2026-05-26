import { Stack } from 'expo-router';

import {
  AuthProvider,
  useAuth,
} from '../contexts/AuthContext';

function AppNavigator() {

  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="login" />
      )}
    </Stack>
  );
}

export default function RootLayout() {

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}