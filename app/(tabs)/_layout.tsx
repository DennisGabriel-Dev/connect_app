import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/services/auth/context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { usuario } = useAuth();

  const isAdmin = usuario?.role === 'admin' || usuario?.isAdmin === true;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerTitleAlign: 'center',
        headerTintColor: 'white',
        headerStyle: {
          backgroundColor: '#1e88e5',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quizzes',
          // Esconde o item da tab bar para não-admin
          href: isAdmin ? '/(tabs)/quiz' : null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="painel"
        options={{
          title: 'Painel',
          // Esconde o item da tab bar para não-admin
          href: isAdmin ? '/(tabs)/painel' : null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
