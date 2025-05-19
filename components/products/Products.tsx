import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, } from 'react-native';
import { Card } from '../common/ProductCard';
import { SearchBar } from '../common/SearchBar';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { CustomOutlineButton } from '../ui/CustomOutlineButton';
import { router } from 'expo-router';


const productData = [
  {
    id: 1,
    image: require('@/assets/images/image(1).png'),
    title: 'Modern Sofa',
    favorites: 34,
    amount: '$230.00',
    stock: 12,
  },
  {
    id: 2,
    image: require('@/assets/images/image(1).png'),
    title: 'Wooden Desk',
    favorites: 21,
    amount: '$180.00',
    stock: 5,
  },
  {
    id: 3,
    image: require('@/assets/images/image(1).png'),
    title: 'Reading Lamp',
    favorites: 56,
    amount: '$75.00',
    stock: 9,
  },
  {
    id: 4,
    image: require('@/assets/images/image(1).png'),
    title: 'Floor Vase',
    favorites: 18,
    amount: '$40.00',
    stock: 6,
  },
   {
    id: 5,
    image: require('@/assets/images/image(1).png'),
    title: 'Modern Sofa',
    favorites: 34,
    amount: '$230.00',
    stock: 12,
  },
  {
    id: 6,
    image: require('@/assets/images/image(1).png'),
    title: 'Wooden Desk',
    favorites: 21,
    amount: '$180.00',
    stock: 5,
  },
  {
    id: 7,
    image: require('@/assets/images/image(1).png'),
    title: 'Reading Lamp',
    favorites: 56,
    amount: '$75.00',
    stock: 9,
  },
  {
    id: 8,
    image: require('@/assets/images/image(1).png'),
    title: 'Floor Vase',
    favorites: 18,
    amount: '$40.00',
    stock: 6,
  },
];

export default function Products() {
     const colorScheme = useColorScheme();
      const theme = Colors[colorScheme ?? 'light'];
       const [filterOpen, setFilterOpen] = useState(false);

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  const filterOptions = [
  'Price: Low to High',
  'Price: High to Low',
  'Newest First',
  'Categories',
  'Rating',
];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
    <SearchBar filterOptions={filterOptions} onFilterToggle={toggleFilter} filterOpen={filterOpen} />

      {/* Product Cards in Grid */}
      <ThemedView style={styles.gridContainer}>
        {productData.map((item) => (
          <ThemedView key={item.id} style={styles.cardWrapper}>
            <Card
              image={item.image}
              title={item.title}
              favorites={item.favorites}
              amount={item.amount}
              stock={item.stock}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(item.id) } })}
            />
          </ThemedView>
        ))}
      </ThemedView>
      <CustomOutlineButton
  title="Have any Questions? Send us a message"
  color={theme.orange}  // orange color (optional)
  onPress={() => alert('Button pressed!')}
   style={styles.bottomOutlineButton}
/>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    paddingVertical: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
   fontWeight:600,
    fontSize: 9.5,
    marginRight: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical:40
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 60,
  },
  bottomOutlineButton: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  
 
});
