import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface Props {
  title: string;
  subtitle: string;
  onPress: () => void;
}

const MessageCard: React.FC<Props> = ({ title, subtitle, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={{display:'flex', gap:24, flexDirection:'row', alignItems:'center'}}>
        <View style={styles.imageContainer}>
        <Image style={styles.image} source={require('../../assets/images/logo.png')} />
        </View>
      <View >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
     
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth:0.5,
    borderBottomColor:'#ccc'
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  subtitle: { color: '#718096' },
 imageContainer: {
  
   
    
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

export default MessageCard;
