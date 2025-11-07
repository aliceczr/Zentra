import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Remove header globalmente para todas as tabs
      }}
    >
      <Tabs.Screen
        // O "name" DEVE ser igual ao nome do arquivo, sem a extensão .tsx
        name="home"
        options={{
          title: 'Home', // Este é o texto que aparece na aba
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="list_produtos"
        options={{
          title: 'Buscar', // Nome que aparecerá na aba
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        // O "name" aqui corresponde ao arquivo perfil.tsx
        name="perfil"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          headerShown: false,
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          headerShown: false,
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="historico_new"
        options={{
          title: 'Histórico New',
          headerShown: false,
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="pagamento"
        options={{
          title: 'Pagamento',
          headerShown: false,
          href: null, // Oculta da barra de navegação
        }}
      />
    </Tabs>
  );
}