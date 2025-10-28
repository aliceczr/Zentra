import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useCarrinhoContador } from '../../hooks/hooksCarrinho';

// Componente para ícone do carrinho com badge
function CarrinhoIcon({ color }: { color: string }) {
  const { quantidade } = useCarrinhoContador();
  
  return (
    <Ionicons 
      size={28} 
      name="cart-outline" 
      color={color}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs>
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
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search-circle-outline"color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          headerShown: false,
          tabBarIcon: ({ color }) => <CarrinhoIcon color={color} />,
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
    </Tabs>
  );
}