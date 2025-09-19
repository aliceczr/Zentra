import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: "Crie sua Conta!", headerBackTitle: "Voltar" }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>

  );
  }