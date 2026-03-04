import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{headerShown:false, title:"Home"}} />
      <Tabs.Screen name="discover" options={{headerShown:false, title:"Discover"}} />
      <Tabs.Screen name="watchlist" options={{headerShown:false, title:"Watchlist"}} />
      <Tabs.Screen name="profile" options={{headerShown:false, title:"Profile"}} /> 
    </Tabs>
  )
}

export default _layout