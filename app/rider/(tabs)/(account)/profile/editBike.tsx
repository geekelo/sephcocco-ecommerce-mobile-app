
import EditBikeInfo from '@/components/rider/account/editBikeInfo'
import EditDocuments from '@/components/rider/account/editDocuments'
import Notifications from '@/components/rider/account/notification'
import RiderProfile from '@/components/rider/account/riderProfile'
import React from 'react'
import { View } from 'react-native'

function EditBikePage() {
  return (
      <View style={{ flex: 1, justifyContent: "center" }}>
      <EditBikeInfo/>
    </View>
  )
}

export default EditBikePage