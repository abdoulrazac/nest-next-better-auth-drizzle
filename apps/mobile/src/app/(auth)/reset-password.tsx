import { authClient } from '@/lib/auth-client';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export default function ResetPasswordScreen() {
  // better-auth passes `token` as a query param in the deep link
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function handleReset() {
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setConfirmPassword('');
      return;
    }
    if (!token) {
      setError('Lien de réinitialisation invalide ou expiré.');
      return;
    }
    setLoading(true);
    setError(null);

    await authClient.resetPassword(
      { newPassword: password, token },
      {
        onSuccess() {
          setDone(true);
        },
        onError(ctx) {
          setError(ctx.error.message ?? 'Une erreur est survenue.');
          setPassword('');
          setConfirmPassword('');
        },
      }
    );

    setLoading(false);
  }

  if (done) {
    return (
      <View className="flex-1 justify-center gap-6 bg-background px-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Mot de passe modifié</Text>
          <Text className="text-sm text-muted-foreground">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous
            connecter.
          </Text>
        </View>
        <Button onPress={() => router.replace('/(auth)/sign-in')}>
          <Text>Se connecter</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-1">
          <Text className="text-3xl font-bold text-foreground">Nouveau mot de passe</Text>
          <Text className="text-sm text-muted-foreground">
            Choisissez un nouveau mot de passe pour votre compte.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Nouveau mot de passe</Text>
            <Input
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Confirmer le mot de passe</Text>
            <Input
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />
          </View>

          {error && <Text className="text-sm text-destructive">{error}</Text>}

          <Button onPress={handleReset} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text>Réinitialiser</Text>
            )}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
