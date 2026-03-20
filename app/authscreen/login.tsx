import { emailIcon, lockIcon, eyeIcon, eyeCloseIcon, googleIcon, appleIcon } from "@/lib/icons";
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
