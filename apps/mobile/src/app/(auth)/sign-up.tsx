import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export default function SignUpScreen() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSignUp() {
    if (!name || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setConfirmPassword('');
      return;
    }
    setLoading(true);
    setError(null);

    await authClient.signUp.email(
      { name, email, password },
      {
        onSuccess() {
          router.replace('/(auth)/sign-in');
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

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-1">
          <Text className="text-3xl font-bold text-foreground">Créer un compte</Text>
          <Text className="text-sm text-muted-foreground">
            Renseignez vos informations pour créer un compte.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Nom complet</Text>
            <Input
              placeholder="Jean Dupont"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              editable={!loading}
            />
          </View>

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

          <Button onPress={handleSignUp} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text>Créer un compte</Text>
            )}
          </Button>
        </View>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Déjà un compte ?</Text>
          <Text
            className="text-sm text-primary underline"
            onPress={() => router.replace('/(auth)/sign-in')}>
            Se connecter
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
