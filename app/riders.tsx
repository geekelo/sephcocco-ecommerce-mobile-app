import Onboarding from '@/components/rider/onboarding/rider';
import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';



export default function Rider() {
  return (
    <View style={styles.container}>
      {/* Fixed Top Navigation */}
     <Onboarding />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30, // to avoid status bar area (optional)
  },
  scrollContent: {
    flexGrow: 1,
  
  },
});
