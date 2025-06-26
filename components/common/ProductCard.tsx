import React from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
  Alert,
  View,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface ProductCardProps {
  image: any;
  title: string;
  favorites: number;
  amount: string;
  stock: number;
  outlet?: string;
  onPress?: () => void;
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
  likedByUser?: boolean;
  onToggleLike?: () => void;
   out_of_stock_status?:boolean
}

export function Card({
  image,
  title,
  favorites,
  amount,
  stock,
  outlet,
  onPress,
  isLoggedIn,
  onLoginPrompt,
  likedByUser,
  onToggleLike,
  out_of_stock_status
}: ProductCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (stock === 0) return;

    if (!isLoggedIn) {
      onLoginPrompt?.() ??
        Alert.alert('Login Required', 'Please login or sign up to place an order.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => console.log('Navigate to Login Screen') },
        ]);
      return;
    }

    onPress?.();
  };

  const handleToggleLike = () => {
    if (!isLoggedIn) {
      onLoginPrompt?.();
      return;
    }
    onToggleLike?.();
  };
  const isOutOfStock = out_of_stock_status === true;
const isLiked = likedByUser ?? favorites > 0;


  return (
    <ThemedView style={styles.card}>
      {/* ❤️ Like Button at top-right */}
      <TouchableOpacity
        style={styles.likeButton}
        onPress={handleToggleLike}
        hitSlop={10}
      >
        <AntDesign
          name={isLiked ? 'heart' : 'hearto'}
          size={16}
          color={isLiked ? theme.orange : theme.gray}
        />
      </TouchableOpacity>

      {/* 🖼️ Product Image */}
      <Image source={image} style={styles.image} />

      <ThemedView style={{ padding: 8 }}>
        <ThemedView style={styles.rowBetween}>
          <ThemedText style={styles.title} fontFamily="Raleway-Regular">
            {title}
          </ThemedText>

          {/* Favorites Count */}
         
        </ThemedView>

        <ThemedView style={styles.rowBetween}>
          <ThemedText style={styles.amount} fontFamily="Raleway-Regular">
            {amount}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.rowBetween}>
          <ThemedText
  style={[styles.amount, { color: theme.success }]}
  fontFamily="Raleway-Regular"
>
  {isOutOfStock ? 'Out of stock' : 'In stock'}
</ThemedText>
<ThemedText style={styles.stockText} fontFamily="Raleway-Regular">
  {stock} items
</ThemedText>

        </ThemedView>
         <View style={styles.favContainer}>
           <AntDesign
  name="like2"
  size={12}
  color={theme.orange}
  style={{ marginRight: 2 }}
/>

            <ThemedText style={styles.favText} fontFamily="Raleway-Regular">
              {favorites}
            </ThemedText>
          </View>
      </ThemedView>

      {/* 📦 Order Button */}
     <TouchableOpacity
  style={[
    styles.button,
    {
      backgroundColor: isOutOfStock ? theme.gray : theme.orange,
      opacity: isOutOfStock ? 0.6 : 1,
    },
  ]}
  onPress={handlePress}
  disabled={isOutOfStock}
>
  <ThemedText
    style={[styles.buttonText, { color: theme.background }]}
    fontFamily="Raleway-Regular"
  >
    {isOutOfStock ? 'Out of Stock' : 'Place Order'}
  </ThemedText>
</TouchableOpacity>

    </ThemedView>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    paddingTop: 10,
    minWidth: 140,
    minHeight: 250,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 999,
    elevation: 2,
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
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  favContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
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
    fontWeight: '600',
  },
});
