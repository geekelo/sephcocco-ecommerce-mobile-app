import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Card } from '../common/ProductCard';
import { router } from 'expo-router';
import axios from 'axios';
import { useProducts } from '@/mutation/useProducts';
type ProductListProps = {
  outlet: 'pharmacy' | 'restaurant' | 'lounge';
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
  userId: string | null; // ✅ Add this
  category?: string;

};


export default function ProductList({ outlet, isLoggedIn, onLoginPrompt, userId , category}: ProductListProps) {
 const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();

  const { data, isLoading, error } = useProducts(outlet, userId);

  const numColumns = width > 768 ? 3 : width > 300 ? 2 : 1;
  const cardWidth = (width - 60 - (numColumns - 1) * 16) / numColumns;
console.log(data)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>New Arrivals - {outlet}</Text>
        <TouchableOpacity style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: theme.orange }]}>See All</Text>
          <Feather name="arrow-right" size={16} color={theme.orange} />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 60 }} />
      )}

      {error && (
        <Text style={{ textAlign: 'center', color: 'red', marginTop: 60 }}>
          Failed to load products.
        </Text>
      )}
 {!isLoading && !error && data?.length === 0 && (
      <Text style={{ textAlign: 'center', marginTop: 60, color: theme.text}}>
        No products available at the moment.
      </Text>
    )}
      <View style={styles.gridContainer}>
        {data?.map((item: any) => (
          <View key={item.id} style={[styles.cardWrapper, { width: cardWidth }]}>
            <Card
  image={{ uri: item.image_url }}
  title={item.name}
  favorites={item.likes}
  amount={`₦${item.price}`}
  stock={item.amount_in_stock}
  outlet={item.outlet}
  isLoggedIn={isLoggedIn}
out_of_stock_status={item.out_of_stock_status}
  likedByUser={item.liked_by_user} // ✅ assuming API returns this field
  onLoginPrompt={onLoginPrompt}
  onToggleLike={() => {
    if (!isLoggedIn) return;
    // You can later wire this to a mutation hook
    console.log('Toggle like for product ID:', item.id);
  }}
  onPress={() =>
    router.push({
      pathname: '/product/[id]',
      params: { id: String(item.id) },
    })
  }
/>

          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 32 : 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontWeight: '600',
    fontSize: 10,
    marginRight: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 24,
    columnGap: 16,
  },
  cardWrapper: {
    marginBottom: 40,
  },
});
