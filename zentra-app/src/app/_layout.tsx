import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import { ProdutoProvider } from "../contexts/produtoContext";
import { CarrinhoProvider } from "../contexts/carrinhoContext";
import { PagamentoProvider } from "../contexts/pagamentoContext";
import { EnderecoProvider } from "../contexts/enderecoContext";

function DeepLinkHandler() {
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ProdutoProvider>
          <CarrinhoProvider>
            <PagamentoProvider>
              <EnderecoProvider>
                <DeepLinkHandler />
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="cadastro" options={{ title: "Crie sua Conta!", headerBackTitle: "Voltar" }} />
                  <Stack.Screen name="entrar" options={{ title: "Entrar", headerBackTitle: "Voltar" }} />
                  <Stack.Screen name="teste" options={{ title: "🧪 Testes", headerBackTitle: "Voltar" }} />
                  <Stack.Screen name="produto" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="pedido-detalhes/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="compra-sucesso" options={{ headerShown: false }} />
                </Stack>
              </EnderecoProvider>
            </PagamentoProvider>
          </CarrinhoProvider>
        </ProdutoProvider>
      </UserProvider>
    </AuthProvider>
  );
}