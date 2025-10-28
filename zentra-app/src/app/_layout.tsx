import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import { ProdutoProvider } from "../contexts/produtoContext";
import { CarrinhoProvider } from "../contexts/carrinhoContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ProdutoProvider>
          <CarrinhoProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="cadastro" options={{ title: "Crie sua Conta!", headerBackTitle: "Voltar" }} />
              <Stack.Screen name="entrar" options={{ title: "Entrar", headerBackTitle: "Voltar" }} />
              <Stack.Screen name="teste" options={{ title: "🧪 Testes", headerBackTitle: "Voltar" }} />
              <Stack.Screen name="produto" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </CarrinhoProvider>
        </ProdutoProvider>
      </UserProvider>
    </AuthProvider>
  );
}