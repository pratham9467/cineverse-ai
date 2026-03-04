import HomeIcon from "@/assets/svg/home.svg"
import ProfileIcon from "@/assets/svg/profile.svg"
import SearchIcon from "@/assets/svg/search.svg"
import WatchlistIcon from "@/assets/svg/watchlist.svg"
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import { Tabs } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  ImageSourcePropType,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View
} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import "../global.css"

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.92;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);

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
    <View style={styles.container}>
      <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabList} onLayout={onLayout}>
          <Animated.View style={[styles.indicator, indicatorStyle]} />

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

            let icon: ImageSourcePropType;
            let label: string;
            switch (route.name) {
              case 'index': icon = HomeIcon; label = 'Home'; break;
              case 'discover': icon = SearchIcon; label = 'Search'; break;
              case 'watchlist': icon = WatchlistIcon; label = 'My List'; break;
              case 'profile': icon = ProfileIcon; label = 'Profile'; break;
              default: icon = HomeIcon; label = '';
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
              >
                <View style={styles.tabContent}>
                  <Image
                    source={icon}
                    style={[
                      styles.icon,
                      { tintColor: isFocused ? '#FFF' : '#94A3B8' }
                    ]}
                  />
                  {isFocused && (
                    <Animated.Text
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(200)}
                      style={styles.label}
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
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Search' }} />
      <Tabs.Screen name="watchlist" options={{ title: 'My List' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  blurContainer: {
    width: TAB_BAR_WIDTH,
    height: 52,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  tabList: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    height: 50,
    backgroundColor: 'rgba(46, 153, 189, 0.85)',
    borderRadius: 50,
    left: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#2E99BD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default _layout;