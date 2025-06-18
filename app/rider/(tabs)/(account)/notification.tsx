
import DeleteAccount from '@/components/rider/account/deleteAccount'
import Notifications from '@/components/rider/account/notification'
import React from 'react'
import { View } from 'react-native'

function NotificationPage() {
  return (
      <View style={{ flex: 1, justifyContent: "center" }}>
      <Notifications />
    </View>
  )
}

export default NotificationPage