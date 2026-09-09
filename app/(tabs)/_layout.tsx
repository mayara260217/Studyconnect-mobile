import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PURPLE = '#7C3AED';
const TAB_BG = '#0A0A0F';
const ICON_INACTIVE = '#4B5563';

function ActiveDot() {
  return <View style={styles.activeDot} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 1,
          borderTopColor: '#1A1A2E',
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: ICON_INACTIVE,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconWrapper}>
              <IconSymbol size={24} name="house.fill" color={color} />
              {focused && <ActiveDot />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="biblioteca"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconWrapper}>
              <IconSymbol size={24} name="books.vertical.fill" color={color} />
              {focused && <ActiveDot />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconWrapper}>
              <IconSymbol size={24} name="chart.bar.fill" color={color} />
              {focused && <ActiveDot />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconWrapper}>
              <IconSymbol size={24} name="person.fill" color={color} />
              {focused && <ActiveDot />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PURPLE,
    shadowColor: PURPLE,
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
});
