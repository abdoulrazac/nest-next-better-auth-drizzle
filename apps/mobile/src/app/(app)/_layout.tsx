import { authClient } from '@/lib/auth-client';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Accueil' }} />
    </Stack>
  );
}
