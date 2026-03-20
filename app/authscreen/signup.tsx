import { emailIcon, lockIcon, userIcon, eyeIcon, eyeCloseIcon } from "@/lib/icons";
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

const SignUpScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup, login } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your name, email and password",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters",
      );
      return;
    }

    try {
      setIsLoading(true);
      await signup(email, password, name);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Signup Failed",
        error.message || "Please check your information and try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.replace("/authscreen/login");
  };

  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute bg-white opacity-10 rounded-sm w-1 h-1 top-[221px] left-[97.5px]" />
        <View className="absolute bg-white opacity-10 rounded-sm w-1 h-1 top-[294.66px] right-[97.5px]" />
        <View className="absolute bg-white opacity-10 rounded-sm w-0.5 h-0.5 bottom-[221px] left-[129.98px]" />
        <View className="absolute bg-white opacity-10 rounded-sm w-1 h-1 top-[589.33px] right-[129.98px]" />
      </View>

      <View className="w-full max-w-[400px]">
        <View className="items-center pb-8">
          <View className="w-20 h-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(140,37,244,0.2)] mb-6">
            <Image
              resizeMode="contain"
              source={require("@/assets/images/logo.png")}
              className="w-20 h-20"
            />
          </View>

          <Text className="text-text-primary font-bold text-display text-center tracking-[-0.75px] mb-2">
            Create Account
          </Text>

          <Text className="text-text-secondary font-light text-label text-center">
            Join CineVerse AI today
          </Text>
        </View>

        <View className="gap-5">
          {/* Name Input */}
          <View className="gap-2">
            <Text className="text-text-muted font-medium text-caption uppercase tracking-[1.2px]">
              Full Name
            </Text>
            <View className="flex-row items-center bg-[#0a1f2a] border border-primary/30 rounded-full px-4 py-1">
              <View className="w-5 h-5 mr-3">
                <SvgXml xml={userIcon} width={20} height={20} />
              </View>
              <TextInput
                className="flex-1 text-text-primary text-body font-light"
                placeholder="John Doe"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

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
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading}
            className="py-4 rounded-full items-center justify-center shadow-lg bg-primary mt-2"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-subtitle tracking-[0.45px]">
                Sign Up
              </Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View className="items-center pt-8">
          <Text className="text-text-muted font-light text-label tracking-[0.35px]">
            Already have an account?{" "}
            <Text
              onPress={handleSignIn}
              className="text-text-primary font-regular"
            >
              Sign In
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SignUpScreen;
