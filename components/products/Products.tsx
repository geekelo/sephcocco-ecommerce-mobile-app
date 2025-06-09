import { Colors } from '@/constants/Colors';
import { useProducts } from '@/hooks/useProducts'; // <- make sure this path is correct
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { Card } from '../common/ProductCard';
import { SearchBar } from '../common/SearchBar';
import { ThemedView } from '../ThemedView';
import { CustomOutlineButton } from '../ui/CustomOutlineButton';
import { router } from 'expo-router';
import { useProductCategories } from '@/hooks/useCategories';

export default function Products() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();
  const [filterOpen, setFilterOpen] = useState(false);
const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


const handleFilterSelect = (option: string) => {
  setSelectedFilter(option);
  if (option === 'Categories') {
    setFilterOpen(false); // Optionally close the dropdown
    console.log('Fetching categories...');
  }
};

  const activeOutlet = 'lounge'; // OR 'pharmacy' / 'restaurant' – make dynamic if needed
  const { data, isLoading, error } = useProducts(activeOutlet);

  const toggleFilter = () => setFilterOpen(!filterOpen);

  const filterOptions = [
    'Price: Low to High',
    'Price: High to Low',
    'Newest First',
    'Categories',
    'Rating',
  ];

  const {
  data: categories,
  isLoading: isCategoriesLoading,
  error: categoriesError,
} = useProductCategories(activeOutlet);

if (selectedFilter === 'Categories') {
  console.log('Selected Categories:', categories);
}


  const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;
  const cardWidth = (width - 60 - (numColumns - 1) * 16) / numColumns;

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <SearchBar
  filterOptions={filterOptions}
  onFilterToggle={toggleFilter}
  filterOpen={filterOpen}
  onFilterSelect={handleFilterSelect}
/>
{selectedFilter === 'Categories' && (
  <View style={styles.categoryDropdown}>
    {isCategoriesLoading && <ActivityIndicator size="small" color={theme.tint} />}
    {categoriesError && <Text style={{ color: 'red' }}>Failed to load categories</Text>}
    {categories && categories.length > 0 && (
      categories.map((cat: any) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryItem,
            selectedCategory === cat.name && { backgroundColor: theme.tint },
          ]}
          onPress={() => setSelectedCategory(cat.name)}
        >
          <Text
            style={{
              color: selectedCategory === cat.name ? '#fff' : theme.text,
              fontWeight: selectedCategory === cat.name ? 'bold' : 'normal',
            }}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))
    )}
  </View>
)}


      {/* Loading & Error States */}
      {isLoading && (
        <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 60 }} />
      )}

      {error && (
        <Text style={{ textAlign: 'center', color: 'red', marginTop: 60 }}>
          Failed to load products.
        </Text>
      )}

      {!isLoading && data && (
        <ThemedView style={styles.gridContainer}>
          {data.map((item: any) => (
            <ThemedView key={item.id} style={[styles.cardWrapper, { width: cardWidth }]}>
             <Card
  image={{ uri: item.image_url }}
  title={item.title}
  favorites={item.favorites}
  amount={`₦${item.price}`}
  stock={item.stock}
  onPress={() =>
    router.push({ pathname: '/product/[id]', params: { id: String(item.id) } })
  }
  outlet={activeOutlet} // required if Card expects outlet
  isLoggedIn={false} // or get it from props/context
  onLoginPrompt={() => alert('Please log in to continue')} // optional
/>

            </ThemedView>
          ))}
        </ThemedView>
      )}

      <CustomOutlineButton
        title="Have any Questions? Send us a message"
        color={theme.orange}
        onPress={() => alert('Button pressed!')}
        style={styles.bottomOutlineButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 32 : 40,
    paddingBottom: 60,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 40,
    margin: 8,
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
  categoryDropdown: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 10,
  marginTop: 10,
  paddingHorizontal: 20,
},
categoryItem: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 20,
  marginBottom: 10,
},

});
