import { Stack } from 'expo-router';

export default function ProdutoLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card', // Apresentação suave
        }} 
      />
    </Stack>
  );
}