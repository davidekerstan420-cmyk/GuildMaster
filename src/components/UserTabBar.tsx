import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ui } from '../constants/theme';
import { tabIcons } from './icons';

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

export default function UserTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  // only routes that have an icon are shown (hidden routes like index/settings are skipped)
  const routes = state.routes.filter(
    (r) => r.name in tabIcons || r.name === 'notifications'
  );

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {routes.map((route) => {
        const focused = state.routes[state.index].key === route.key;
        const icons = tabIcons[route.name as keyof typeof tabIcons];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented)
            navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.cell, focused && styles.cellActive]}
          >
            {icons ? (
              <Image
                source={focused ? icons.active : icons.idle}
                style={styles.icon}
                resizeMode="contain"
              />
            ) : (
              <Text
                style={[
                  styles.notificationIcon,
                  focused && styles.notificationIconActive,
                ]}
              >
                ♧
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: ui.tabBar },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cellActive: { backgroundColor: ui.tabActive },
  icon: { width: 72, height: 72 },
  notificationIcon: { color: ui.buttonText, fontSize: 38, lineHeight: 72 },
  notificationIconActive: { color: ui.tabActive },
});
