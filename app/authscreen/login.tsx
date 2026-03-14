import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useAuth } from "../../contexts/AuthContext";

const emailIcon = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="18" height="14" rx="2" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M1 4L10 9L19 4" stroke="#2F9BBC" stroke-width="1.5"/>
</svg>`;

const lockIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="7" width="16" height="12" rx="2" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M5 7V4C5 2.34315 6.34315 1 8 1C9.65685 1 11 2.34315 11 4V7" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
<circle cx="9" cy="13" r="2" fill="#2F9BBC"/>
</svg>`;

const eyeIcon = `<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#2F9BBC"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
const eyeCloseIcon = `<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14.8335C21.3082 13.3317 22 12 22 12C22 12 18.3636 5 12 5C11.6588 5 11.3254 5.02013 11 5.05822C10.6578 5.09828 10.3244 5.15822 10 5.23552M12 9C12.3506 9 12.6872 9.06015 13 9.17071C13.8524 9.47199 14.528 10.1476 14.8293 11C14.9398 11.3128 15 11.6494 15 12M3 3L21 21M12 15C11.6494 15 11.3128 14.9398 11 14.8293C10.1476 14.528 9.47198 13.8524 9.1707 13C9.11386 12.8392 9.07034 12.6721 9.04147 12.5M4.14701 9C3.83877 9.34451 3.56234 9.68241 3.31864 10C2.45286 11.1282 2 12 2 12C2 12 5.63636 19 12 19C12.3412 19 12.6746 18.9799 13 18.9418" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

const googleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.56 12.25C22.56 11.56 22.5 10.91 22.4 10.28H12V14.03H18.44C18.19 15.56 17.44 16.83 16.29 17.62V20.03H19.88C21.96 18.05 23.25 15.02 23.25 12.25H22.56Z" fill="#4285F4"/>
<path d="M12 23C14.97 23 17.46 21.79 19.88 20.03L16.29 17.62C15.11 18.5 13.65 19.04 12 19.04C9.12 19.04 6.71 17.14 5.84 14.47L2.24 17.04C3.99 20.68 7.89 23 12 23Z" fill="#34A853"/>
<path d="M5.84 14.47C5.54 13.81 5.39 13.08 5.39 12.31C5.39 11.54 5.54 10.81 5.84 10.15L2.24 7.41C1.39 9.07 0.94 10.99 0.94 12.31C0.94 13.63 1.39 15.55 2.24 17.21L5.84 14.47Z" fill="#FBBC05"/>
<path d="M12 5.38C13.29 5.38 14.47 5.9 15.41 6.82L19.08 3.15C17.45 1.49 15.32 0.5 12 0.5C7.89 0.5 3.99 2.82 2.24 6.46L5.84 9.12C6.71 6.45 9.12 4.5 12 4.5C12.76 4.5 13.48 4.64 14.15 4.91L16.91 2.15C15.46 1.15 13.76 0.5 12 0.5Z" fill="#EA4335"/>
</svg>`;

const appleIcon = `<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"></path> </g></svg>`;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle, loginWithApple } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password",
      );
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        "Please check your credentials and try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Google Login Failed", "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithApple();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Apple Login Failed", "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    Alert.alert("Coming Soon", "Password reset feature will be available soon");
  };

  const handleSignUp = () => {
    router.push("/authscreen/signup");
  };

  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      {/* Background Decorative Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute bg-white opacity-10 rounded-sm w-1 h-1 top-[221px] left-[97.5px]" />
        <View className="absolute bg-white opacity-10 rounded-sm w-1 h-1 top-[294.66px] right-[97.5px]" />
        <View className="absolute bg-white opacity-10 rounded-sm w-0.5 h-0.5 bottom-[221px] left-[129.98px]" />
        <View className="absolute bg-white opacity-10 rounded-sm w-1 h-1 top-[589.33px] right-[129.98px]" />
      </View>

      <View className="w-full max-w-[400px]">
        <View className="items-center pb-12">
          <View className="w-20 h-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(140,37,244,0.2)] mb-6">
            <Image
              resizeMode="contain"
              source={require("@/assets/images/logo.png")}
              className="w-20 h-20"
            />
          </View>

          {/* Heading */}
          <Text className="text-text-primary font-bold text-display text-center tracking-[-0.75px] mb-2">
            CineVerse AI
          </Text>

          {/* Subtitle */}
          <Text className="text-text-secondary font-light text-label text-center">
            Experience cinematic storytelling
          </Text>
        </View>

        {/* Form Section */}
        <View className="gap-6">
          {/* Email Input */}
          <View className="gap-2">
            <Text className="text-text-muted font-medium text-caption uppercase tracking-[1.2px]">
              Email Address
            </Text>
            <View className="flex-row items-center bg-[#0a1f2a] border border-primary/30 rounded-full px-4 py-1">
              <View className="w-5 h-4 mr-3">
                <SvgXml xml={emailIcon} width={20} height={16} />
              </View>
              <TextInput
                className="flex-1 text-text-primary text-body font-light"
                placeholder="name@example.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="gap-2">
            <Text className="text-text-muted font-medium text-caption uppercase tracking-[1.2px]">
              Password
            </Text>
            <View className="flex-row items-center bg-[#0a1f2a] border border-primary/30 rounded-full px-4 py-1">
              <View className="w-[18px] h-5 mr-3">
                <SvgXml xml={lockIcon} width={18} height={20} />
              </View>
              <TextInput
                className="flex-1 text-text-primary text-body font-light"
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <View className="w-6 h-[24px]">
                  {showPassword ? (<SvgXml xml={eyeIcon} width={24} height={24} />):(<SvgXml xml={eyeCloseIcon} width={24} height={24} />)} 
                </View>
              </Pressable>
            </View>

            {/* Forgot Password */}
            <Pressable onPress={handleForgotPassword} className="self-end">
              <Text className="text-primary text-caption font-regular opacity-80">
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            className="py-4 rounded-full items-center justify-center shadow-lg bg-primary"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-subtitle tracking-[0.45px]">
                Sign In
              </Text>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View className="flex-row items-center gap-4 py-10">
          <View className="flex-1 h-px bg-primary/20" />
          <Text className="text-text-placeholder font-medium text-caption uppercase tracking-[1.2px]">
            Or continue with
          </Text>
          <View className="flex-1 h-px bg-primary/20" />
        </View>

        {/* Social Login */}
        <View className="flex-row justify-center gap-6 pb-12">
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            className="w-14 h-14 items-center justify-center rounded-full bg-[#0a1f2a] border border-primary/20 shadow-[0_0_15px_rgba(47,155,188,0.1)]"
          >
            <SvgXml xml={googleIcon} width={24} height={24} />
          </Pressable>
          <Pressable
            onPress={handleAppleSignIn}
            disabled={isLoading}
            className="w-14 h-14 items-center justify-center rounded-full bg-[#0a1f2a] border border-primary/20 shadow-[0_0_15px_rgba(47,155,188,0.1)]"
          >
            <SvgXml xml={appleIcon} width={24} height={24} />
          </Pressable>
        </View>

        {/* Footer */}
        <View className="items-center">
          <Text className="text-text-muted font-light text-label tracking-[0.35px]">
            New to CineVerse?{" "}
            <Text
              onPress={handleSignUp}
              className="text-text-primary font-regular"
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
