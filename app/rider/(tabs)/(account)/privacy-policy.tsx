import PrivacyPolicy from '@/components/rider/account/privacyPolicy'
import Settings from '@/components/rider/account/settings'
import React from 'react'
import { View } from 'react-native'

function PrivacyPolicyPage() {
  return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <PrivacyPolicy />
    </View>
  )
}

export default PrivacyPolicyPage