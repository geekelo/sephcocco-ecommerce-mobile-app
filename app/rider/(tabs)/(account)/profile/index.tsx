
import Notifications from '@/components/rider/account/notification'
import RiderProfile from '@/components/rider/account/riderProfile'
import React from 'react'
import { View } from 'react-native'

function RidersPage() {
  return (
      <View style={{ flex: 1, justifyContent: "center" }}>
      <RiderProfile/>
    </View>
  )
}

export default RidersPage