import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export default function SignInScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSignIn() {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.email(
      { email, password },
      {
        onSuccess(ctx) {
          if (ctx.data.twoFactorRedirect) {
            router.replace('/(auth)/two-factor');
          } else {
            router.replace('/(app)');
          }
        },
        onError(ctx) {
          setError(ctx.error.message ?? 'Une erreur est survenue.');
          setPassword('');
        },
      }
    );

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-1">
          <Text className="text-3xl font-bold text-foreground">Connexion</Text>
          <Text className="text-sm text-muted-foreground">
            Entrez vos identifiants pour accéder à votre compte.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Input
              placeholder="email@exemple.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Mot de passe</Text>
            <Input
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              editable={!loading}
            />
          </View>

          {error && <Text className="text-sm text-destructive">{error}</Text>}

          <Button onPress={handleSignIn} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="white" /> : <Text>Se connecter</Text>}
          </Button>
        </View>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Pas encore de compte ?</Text>
          <Text
            className="text-sm text-primary underline"
            onPress={() => router.push('/(auth)/sign-up')}>
            S'inscrire
          </Text>
        </View>

        <View className="flex-row justify-center">
          <Text
            className="text-sm text-muted-foreground underline"
            onPress={() => router.push('/(auth)/forgot-password')}>
            Mot de passe oublié ?
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
