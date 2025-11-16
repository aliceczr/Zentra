import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Tabs.Screen
        
        name="home"
        options={{
          title: 'Home', 
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="list_produtos"
        options={{
          title: 'Buscar', 
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        
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
          href: null, 
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}