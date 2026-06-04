import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit() {
    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }
    setLoading(true);
    setError(null);

    await authClient.forgetPassword(
      {
        email,
        redirectTo: 'mobile://reset-password',
      },
      {
        onSuccess() {
          setSent(true);
        },
        onError(ctx) {
          setError(ctx.error.message ?? 'Une erreur est survenue.');
        },
      }
    );

    setLoading(false);
  }

  if (sent) {
    return (
      <View className="flex-1 justify-center gap-6 bg-background px-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Email envoyé</Text>
          <Text className="text-sm text-muted-foreground">
            Un lien de réinitialisation a été envoyé à {email}. Vérifiez votre boîte de réception.
          </Text>
        </View>
        <Button variant="outline" onPress={() => router.replace('/(auth)/sign-in')}>
          <Text>Retour à la connexion</Text>
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
          <Text className="text-3xl font-bold text-foreground">Mot de passe oublié</Text>
          <Text className="text-sm text-muted-foreground">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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

          {error && <Text className="text-sm text-destructive">{error}</Text>}

          <Button onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text>Envoyer le lien</Text>
            )}
          </Button>
        </View>

        <View className="flex-row justify-center">
          <Text className="text-sm text-muted-foreground underline" onPress={() => router.back()}>
            Retour à la connexion
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
