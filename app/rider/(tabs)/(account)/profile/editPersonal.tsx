
import EditDocuments from '@/components/rider/account/editDocuments'
import EditPersonalInfo from '@/components/rider/account/editPersonalInfo'
import Notifications from '@/components/rider/account/notification'
import RiderProfile from '@/components/rider/account/riderProfile'
import React from 'react'
import { View } from 'react-native'

function EditPersonalPage() {
  return (
      <View style={{ flex: 1, justifyContent: "center" }}>
      <EditPersonalInfo/>
    </View>
  )
}

export default EditPersonalPage