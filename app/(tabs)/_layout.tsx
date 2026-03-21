import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  View
} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import { SvgXml } from 'react-native-svg'
import { homeIcon, searchIcon, watchlistIcon, profileIcon, socialIcon } from '@/lib/icons'
import { useThemeMode } from '@/contexts/ThemeModeContext'
import "../global.css"

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.92;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);
  const { colors } = useThemeMode();

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(state.index * tabWidth, {
        damping: 18,
        stiffness: 120,
        mass: 0.8
      });
    }
  }, [state.index, tabWidth, translateX]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabWidth(width / state.routes.length);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  return (
    <View
      className="absolute items-center justify-center z-[100]"
      style={{ bottom: 50, width: SCREEN_WIDTH }}
    >
      <BlurView
        intensity={90}
        tint="dark"
        className="rounded-full overflow-hidden border border-white/20 px-1"
        style={{
          width: TAB_BAR_WIDTH,
          height: 52,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <View className="flex-row flex-1 items-center px-0.5" onLayout={onLayout}>
          {/* Animated indicator — colors sync with movie/anime mode */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                height: 40,
                backgroundColor: colors.primaryBg,
                borderRadius: 25,
                padding: 4,
                left: 0,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                shadowColor: colors.primaryShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              },
              indicatorStyle,
            ]}
          />

          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let icon: string;
            let label: string;
            switch (route.name) {
              case 'index': icon = homeIcon; label = 'Home'; break;
              case 'discover': icon = searchIcon; label = 'Search'; break;
              case 'social': icon = socialIcon; label = 'Social'; break;
              case 'watchlist': icon = watchlistIcon; label = 'My List'; break;
              case 'profile': icon = profileIcon; label = 'Profile'; break;
              default: icon = homeIcon; label = '';
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="flex-1 h-full items-center justify-center"
              >
                <View className="flex-row items-center justify-center z-[2]">
                  <SvgXml
                    xml={icon}
                    width={20}
                    height={20}
                    color={isFocused ? '#FFFFFF' : '#94A3B8'}
                  />
                  {isFocused && (
                    <Animated.Text
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(200)}
                      className="text-white text-caption font-semibold ml-0.5"
                      style={{
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      }}
                    >
                      {label}
                    </Animated.Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#000000' },
        animation: 'none',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Search' }} />
      <Tabs.Screen name="social" options={{ title: 'Social' }} />
      <Tabs.Screen name="watchlist" options={{ title: 'My List' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
};

export default _layout;
