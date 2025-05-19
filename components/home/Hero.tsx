import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  useColorScheme,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '../ThemedText';
import { SearchBar } from '../common/SearchBar';
import { Link } from 'expo-router';

export function HeroPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleFilter = () => setFilterOpen(!filterOpen);
  const filterOptions = [
  'Price: Low to High',
  'Price: High to Low',
  'Newest First',
  'Categories',
  'Rating',
];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search & Filter */}
      <SearchBar onFilterToggle={toggleFilter} filterOptions={filterOptions} filterOpen={filterOpen} />

      {/* Hero Background with Centered Content */}
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={require('@/assets/images/Rectangle 4(1).png')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <ThemedText type='subtitle'  style={{color:theme.background}}>Welcome to Our Store</ThemedText>
            <Text style={styles.heroText}>Shop Amazing Products at Affordable Prices</Text>
            <TouchableOpacity style={styles.heroButton}>
              <Link href='/ProductPage' style={styles.heroButtonText}>Shop Now</Link>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  heroWrapper: {
    marginTop: 20,
    height: 400,
    overflow: 'hidden',
    borderRadius: 12,
   
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  heroText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    paddingTop:5
  },
  heroButton: {
    backgroundColor: '#F93A01',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 6,
    cursor:'pointer',
    marginTop:6
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
