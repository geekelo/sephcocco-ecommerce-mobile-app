import React from 'react';
import { StyleSheet, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface ProductCardProps {
  image: any;
  title: string;
  favorites: number;
  amount: string;
  stock: number;
  onPress?: () => void;
}

export function Card({
  image,
  title,
  favorites,
  amount,
  stock,
  onPress,
}: ProductCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.card, ]}>
<ThemedView style={{padding:8}}>
      <Image source={image} style={styles.image} />

      <ThemedView style={styles.rowBetween}>
        <ThemedText style={styles.title} fontFamily='Raleway-Regular'>{title}</ThemedText>
        <ThemedView style={styles.favContainer}>
          <AntDesign name="hearto" size={10} color={theme.orange} />
          <ThemedText style={styles.favText} fontFamily='Raleway-Regular'>{favorites}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.rowBetween}>
        <ThemedText style={styles.amount} fontFamily='Raleway-Regular'>{amount}</ThemedText>
      
      </ThemedView>
       <ThemedView style={styles.rowBetween}>
        <ThemedText style={[styles.amount, {color:theme.success}]} fontFamily='Raleway-Regular'>In stock</ThemedText>
        <ThemedText style={styles.stockText} fontFamily='Raleway-Regular'> {stock} items</ThemedText>
      </ThemedView>
      </ThemedView>

      <TouchableOpacity style={[styles.button, {backgroundColor:theme.orange}]} onPress={onPress}>
        <ThemedText style={[styles.buttonText, {color:theme.background}]} fontFamily='Raleway-Regular'>Place Order</ThemedText>
     
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
  borderRadius: 6,
  paddingTop: 10,
  minWidth: 140,
  justifyContent: 'space-between',
  minHeight: 250,
  elevation: 3, // Android shadow

  // iOS shadow
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  backgroundColor: '#fff', // Needed for shadow to be visible on iOS
},

  image: {
  width: '100%',
  height: undefined,
  aspectRatio: 1.2, 
  borderRadius: 6,
  resizeMode: 'contain',
  marginBottom: 10,
},

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
  },
  favContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favText: {
    fontSize: 12,
  },
  amount: {
    fontSize: 12,
    fontWeight: '800',
  },
  stockText: {
    fontSize: 8,
    fontWeight:500
  },
  button: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderBottomEndRadius: 7,
     borderBottomStartRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 600,
  },
});
