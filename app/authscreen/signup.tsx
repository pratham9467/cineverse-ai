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

const userIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="8" r="4" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const eyeIcon = `<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#2F9BBC"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
const eyeCloseIcon = `<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14.8335C21.3082 13.3317 22 12 22 12C22 12 18.3636 5 12 5C11.6588 5 11.3254 5.02013 11 5.05822C10.6578 5.09828 10.3244 5.15822 10 5.23552M12 9C12.3506 9 12.6872 9.06015 13 9.17071C13.8524 9.47199 14.528 10.1476 14.8293 11C14.9398 11.3128 15 11.6494 15 12M3 3L21 21M12 15C11.6494 15 11.3128 14.9398 11 14.8293C10.1476 14.528 9.47198 13.8524 9.1707 13C9.11386 12.8392 9.07034 12.6721 9.04147 12.5M4.14701 9C3.83877 9.34451 3.56234 9.68241 3.31864 10C2.45286 11.1282 2 12 2 12C2 12 5.63636 19 12 19C12.3412 19 12.6746 18.9799 13 18.9418" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

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
