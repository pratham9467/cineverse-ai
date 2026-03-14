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
import "../global.css"

const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>`;
const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>`;
const watchlistIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M452-160q6 20 16.5 41.5T490-80H200q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h480q33 0 56.5 23.5T760-800v284q-18-2-40-2t-40 2v-284H480v280l-100-60-100 60v-280h-80v640h252Zm126.5 61.5Q520-157 520-240t58.5-141.5Q637-440 720-440t141.5 58.5Q920-323 920-240T861.5-98.5Q803-40 720-40T578.5-98.5ZM670-140l160-100-160-100v200ZM280-800h200-200Zm172 0H200h480-240 12Z"/></svg>`;
const profileIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/></svg>`;

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
    <View
      className="absolute items-center justify-center z-[100]"
      style={{ bottom: 50, width: SCREEN_WIDTH }}
    >
      <BlurView
        intensity={90}
        tint="dark"
        className="rounded-full overflow-hidden border border-white/20"
        style={{
          width: TAB_BAR_WIDTH,
          height: 52,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <View className="flex-row flex-1 items-center px-0.5" onLayout={onLayout}>
          {/* Animated indicator — must use style for animated transforms + shadow */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                height: 50,
                backgroundColor: 'rgba(46, 153, 189, 0.8)',
                borderRadius: 50,
                left: 0,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                shadowColor: '#2E99BD',
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
      <Tabs.Screen name="watchlist" options={{ title: 'My List' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
};

export default _layout;
