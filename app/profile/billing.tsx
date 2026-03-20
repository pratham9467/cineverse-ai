import { useAuth } from '@/contexts/AuthContext'
import { chevronLeft, chevronRight, checkIcon, starIconBlue as starIcon } from '@/lib/icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const Billing = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  const isPremium = (user as any)?.isPremium || false

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'This would open the payment flow. Premium features include:\n\n• 4K Ultra HD streaming\n• Download for offline viewing\n• Ad-free experience\n• Early access to new releases',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade - $9.99/mo', onPress: () => Alert.alert('Coming Soon', 'Premium upgrade will be available soon!') }
      ]
    )
  }

  const handleManageSubscription = () => {
    Alert.alert('Manage Subscription', 'Subscription management coming soon!')
  }

  const handlePaymentMethod = () => {
    Alert.alert('Payment Methods', 'Payment method management coming soon!')
  }

  const handleBillingHistory = () => {
    Alert.alert('Billing History', 'Billing history coming soon!')
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
        <Text className="text-secondary font-bold text-xl">Billing & Subscription</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Current Plan */}
        <View className="mt-6">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Current Plan
          </Text>
          <View 
            className={`rounded-2xl p-5 ${isPremium ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-white/5'}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-secondary font-bold text-xl">
                  {isPremium ? 'Premium' : 'Basic'} Plan
                </Text>
                <Text className="text-text-muted text-sm mt-1">
                  {isPremium ? 'Unlimited access to all features' : 'Limited access with ads'}
                </Text>
              </View>
              {isPremium && (
                <View className="flex-row items-center gap-1">
                  <SvgXml xml={starIcon} width={16} height={16} />
                  <Text className="text-primary font-bold text-sm">PRO</Text>
                </View>
              )}
            </View>
            
            <View className="mt-4 flex-row items-baseline">
              <Text className="text-secondary font-bold text-3xl">
                {isPremium ? '$9.99' : '$0'}
              </Text>
              <Text className="text-text-muted text-sm">/month</Text>
            </View>

            {!isPremium && (
              <TouchableOpacity 
                onPress={handleUpgrade}
                className="mt-4 bg-primary py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-sm">Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Plan Features */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Premium Features
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            {[
              { text: '4K Ultra HD Streaming', included: isPremium },
              { text: 'Download for Offline', included: isPremium },
              { text: 'Ad-Free Experience', included: isPremium },
              { text: 'Early Access Content', included: isPremium },
              { text: 'AI Recommendations', included: true },
              { text: 'Basic Streaming', included: true },
            ].map((feature, index) => (
              <View key={index}>
                {index > 0 && <View className="mx-5 border-t border-white/5" />}
                <View className="flex-row items-center justify-between px-5 py-3.5">
                  <Text className={`text-[15px] ${feature.included ? 'text-secondary' : 'text-text-muted'}`}>
                    {feature.text}
                  </Text>
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${feature.included ? 'bg-primary/20' : 'bg-white/5'}`}>
                    <SvgXml 
                      xml={checkIcon.replace(feature.included ? '#2F9BBC' : '#64748B', feature.included ? '#2F9BBC' : '#4B5563')} 
                      width={14} 
                      height={14} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Billing Actions */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Billing
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <TouchableOpacity 
              onPress={handlePaymentMethod}
              className="flex-row items-center justify-between px-5 py-4"
            >
              <Text className="text-secondary text-[15px] font-medium">Payment Methods</Text>
              <SvgXml xml={chevronRight} width={8} height={14} />
            </TouchableOpacity>
            
            <View className="mx-5 border-t border-white/5" />
            
            <TouchableOpacity 
              onPress={handleBillingHistory}
              className="flex-row items-center justify-between px-5 py-4"
            >
              <Text className="text-secondary text-[15px] font-medium">Billing History</Text>
              <SvgXml xml={chevronRight} width={8} height={14} />
            </TouchableOpacity>

            {isPremium && (
              <>
                <View className="mx-5 border-t border-white/5" />
                <TouchableOpacity 
                  onPress={handleManageSubscription}
                  className="flex-row items-center justify-between px-5 py-4"
                >
                  <Text className="text-secondary text-[15px] font-medium">Manage Subscription</Text>
                  <SvgXml xml={chevronRight} width={8} height={14} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Help Text */}
        <View className="mt-8 px-2">
          <Text className="text-text-muted text-xs text-center leading-5">
            Questions about billing? Contact support at support@cineverse.app
          </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default Billing