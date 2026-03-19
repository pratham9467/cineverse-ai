import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const chevronLeft = `<svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 16L2 9L9 2" stroke="#2F9BBC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const editProfile = `<svg width="12" height="12" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 8H1.7125L6.6 3.1125L5.8875 2.4L1 7.2875V8ZM0 9V6.875L6.6 0.2875C6.7 0.195833 6.81042 0.125 6.93125 0.075C7.05208 0.025 7.17917 0 7.3125 0C7.44583 0 7.575 0.025 7.7 0.075C7.825 0.125 7.93333 0.2 8.025 0.3L8.7125 1C8.8125 1.09167 8.88542 1.2 8.93125 1.325C8.97708 1.45 9 1.575 9 1.7C9 1.83333 8.97708 1.96042 8.93125 2.08125C8.88542 2.20208 8.8125 2.3125 8.7125 2.4125L2.125 9H0ZM8 1.7L7.3 1L8 1.7ZM6.2375 2.7625L5.8875 2.4L6.6 3.1125L6.2375 2.7625Z" fill="white"/>
</svg>`
const chevronRight = `<svg width="8" height="14" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L6 6L1 11" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const userImage = require('@/assets/images/user.png')

const AccountDetails = () => {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!')
  }

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon!')
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.')
          }
        }
      ]
    )
  }

  return (
    <View className="flex-1 bg-background">
      <View className="pt-12 pb-4 px-5 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-primary/10 rounded-full"
        >
          <SvgXml xml={chevronLeft} width={10} height={18} />
        </TouchableOpacity>
        <Text className="text-secondary font-bold text-xl">Account Details</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View className="mt-6 items-center">
          <View style={{ position: 'relative' }}>
            <View style={{
              borderRadius: 100,
              padding: 2,
              backgroundColor: '#2F9BBC',
            }}>
              <View style={{
                backgroundColor: '#000000',
                borderRadius: 100,
                padding: 4,
              }}>
                <Image
                  source={userImage}
                  style={{ width: 112, height: 112, borderRadius: 100 }}
                  resizeMode="cover"
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={handleEditProfile}
              style={{
                position: 'absolute',
                bottom: 4,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 100,
                backgroundColor: '#2F9BBC',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
              }}
            >
              <SvgXml xml={editProfile} width={14} height={14} />
            </TouchableOpacity>
          </View>

          <Text className="text-secondary font-bold text-2xl mt-4">
            {user?.name || 'Guest User'}
          </Text>
          <Text className="text-text-muted text-sm mt-1">
            {user?.email || 'guest@cineverse.app'}
          </Text>
        </View>

        {/* Personal Information */}
        <View className="mt-10">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Personal Information
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <View className="px-5 py-4">
              <Text className="text-text-muted text-xs mb-1">Full Name</Text>
              <Text className="text-secondary text-[15px] font-medium">
                {user?.name || 'Not set'}
              </Text>
            </View>

            <View className="mx-5 border-t border-white/5" />

            <View className="px-5 py-4">
              <Text className="text-text-muted text-xs mb-1">Email Address</Text>
              <Text className="text-secondary text-[15px] font-medium">
                {user?.email || 'Not set'}
              </Text>
            </View>

            <View className="mx-5 border-t border-white/5" />

            <View className="px-5 py-4">
              <Text className="text-text-muted text-xs mb-1">Account ID</Text>
              <Text className="text-secondary text-[15px] font-medium" numberOfLines={1}>
                {(user as any)?.$id || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Account Actions
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={handleEditProfile}
              className="flex-row items-center justify-between px-5 py-4"
            >
              <Text className="text-secondary text-[15px] font-medium">Edit Profile</Text>
              <SvgXml xml={chevronRight} width={8} height={14} />
            </TouchableOpacity>

            <View className="mx-5 border-t border-white/5" />

            <TouchableOpacity
              onPress={handleChangePassword}
              className="flex-row items-center justify-between px-5 py-4"
            >
              <Text className="text-secondary text-[15px] font-medium">Change Password</Text>
              <SvgXml xml={chevronRight} width={8} height={14} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mt-8">
          <Text className="text-red-500/60 text-xs font-semibold uppercase tracking-wider mb-3">
            Danger Zone
          </Text>
          <View className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="flex-row items-center justify-between px-5 py-4"
            >
              <Text className="text-red-500 text-[15px] font-medium">Delete Account</Text>
              <SvgXml xml={chevronRight.replace('#64748B', '#EF4444')} width={8} height={14} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default AccountDetails