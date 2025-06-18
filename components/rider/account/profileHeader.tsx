import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const ProfileHeader = () => (
  <View>
    <LinearGradient
      colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
      style={styles.gradient}
    />
    <View style={styles.avatarContainer}>
      <Image source={require('@/assets/images/Ellipse 258.png')} style={styles.avatar} />
      <TouchableOpacity style={styles.editIcon}>
        <Ionicons name="create" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
    <Text style={styles.name}>John Doe</Text>
    <Text style={styles.status}>Offline</Text>
  </View>
);

export default ProfileHeader;

const styles = StyleSheet.create({
  gradient: {
    height: 110,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: -1,
  },
  avatarContainer: {
    marginTop: 50,
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: '43%',
    backgroundColor: Colors.light.orange,
    borderRadius: 12,
    padding: 4,
  },
  name: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginTop: 10 },
  status: { color: 'rgba(0, 0, 0, 0.7)', textAlign: 'center', fontWeight:500, fontFamily:'Raleway' },
});
