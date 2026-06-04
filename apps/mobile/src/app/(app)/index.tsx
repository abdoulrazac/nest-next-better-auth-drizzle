import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background p-6">
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-foreground">Bienvenue 👋</Text>
        {session?.user?.name && <Text className="text-muted-foreground">{session.user.name}</Text>}
        {session?.user?.email && (
          <Text className="text-sm text-muted-foreground">{session.user.email}</Text>
        )}
      </View>

      <Button variant="outline" onPress={handleSignOut}>
        <Text>Se déconnecter</Text>
      </Button>
    </View>
  );
}
