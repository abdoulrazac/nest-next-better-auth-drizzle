import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export default function TwoFactorScreen() {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleVerify() {
    if (!code || code.length < 6) {
      setError('Entrez le code à 6 chiffres.');
      return;
    }
    setLoading(true);
    setError(null);

    await authClient.twoFactor.verifyOtp(
      { code },
      {
        onSuccess() {
          router.replace('/(app)');
        },
        onError(ctx) {
          setError(ctx.error.message ?? 'Code invalide ou expiré.');
          setCode('');
        },
      }
    );

    setLoading(false);
  }

  async function handleResend() {
    setError(null);
    await authClient.twoFactor.sendOtp();
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-1">
          <Text className="text-3xl font-bold text-foreground">Vérification en deux étapes</Text>
          <Text className="text-sm text-muted-foreground">
            Entrez le code reçu par email ou depuis votre application d'authentification.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Code de vérification</Text>
            <Input
              placeholder="123456"
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
          </View>

          {error && <Text className="text-sm text-destructive">{error}</Text>}

          <Button onPress={handleVerify} disabled={loading || code.length < 6}>
            {loading ? <ActivityIndicator size="small" color="white" /> : <Text>Vérifier</Text>}
          </Button>

          <Button variant="ghost" onPress={handleResend} disabled={loading}>
            <Text>Renvoyer le code</Text>
          </Button>
        </View>

        <View className="flex-row justify-center gap-1">
          <Text
            className="text-sm text-muted-foreground underline"
            onPress={() => router.replace('/(auth)/sign-in')}>
            Retour à la connexion
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
