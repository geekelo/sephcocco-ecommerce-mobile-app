import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Card } from '../common/ProductCard';
import { router } from 'expo-router';
import { productData } from '../common/ProductData';
type ProductListProps = {
  outlet: 'pharmacy' | 'restaurant' | 'lounge';
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
};

export default function ProductList({ outlet, isLoggedIn, onLoginPrompt }: ProductListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const filteredProducts = productData.filter((item) => item.outlet === outlet);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>New Arrivals - {outlet}</Text>
        <TouchableOpacity style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: theme.orange }]}>See All</Text>
          <Feather name="arrow-right" size={16} color={theme.orange} />
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {filteredProducts.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <Card
              image={item.image}
              title={item.title}
              favorites={item.favorites}
              amount={item.amount}
              stock={item.stock}
              outlet={item.outlet}
              isLoggedIn={isLoggedIn}
              onLoginPrompt={onLoginPrompt}
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
    padding: 20,
    paddingVertical: 20,
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
    fontSize: 9.5,
    marginRight: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 60,
  },
});
