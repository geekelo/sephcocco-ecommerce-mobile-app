import React, { useState, useCallback } from 'react';
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

// Define the props interface for HeroPage
interface HeroPageProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
  onFilterChange: (filter: string | null) => void;
  searchQuery: string;
  selectedCategory: string | null;
  selectedFilter: string | null;
}

export function HeroPage({
  onSearchChange,
  onCategoryChange,
  onFilterChange,
  searchQuery,
  selectedCategory,
  selectedFilter
}: HeroPageProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // State for filter dropdown
  const [filterOpen, setFilterOpen] = useState(false);

  // Toggle filter dropdown
  const toggleFilter = useCallback(() => {
    setFilterOpen(!filterOpen);
  }, [filterOpen]);

  // Handle search input changes
  const handleSearchChange = useCallback((text: string) => {
    onSearchChange(text);
    console.log("Search query:", text);
  }, [onSearchChange]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    onCategoryChange(category);
    setFilterOpen(false);
    console.log("Selected category:", category);
  }, [onCategoryChange]);

  // Handle filter selection (Price, Rating, etc.)
  const handleFilterSelect = useCallback((filter: string) => {
    onFilterChange(filter);
    setFilterOpen(false);
    console.log("Selected filter:", filter);
  }, [onFilterChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    onSearchChange('');
    onCategoryChange(null);
    onFilterChange(null);
    console.log("Filters cleared");
  }, [onSearchChange, onCategoryChange, onFilterChange]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search & Filter */}
      <SearchBar
        onFilterToggle={toggleFilter}
        filterOpen={filterOpen}
        onSearchChange={handleSearchChange}
        onCategorySelect={handleCategorySelect}
        onFilterSelect={handleFilterSelect}
        searchQuery={searchQuery}
      />

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory || selectedFilter) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={[styles.activeFiltersTitle, { color: theme.text }]}>
            Active Filters:
          </Text>
          <View style={styles.filterChips}>
            {searchQuery && (
              <View style={[styles.filterChip, { backgroundColor: theme.orange }]}>
                <Text style={styles.filterChipText}>Search: "{searchQuery}"</Text>
              </View>
            )}
            {selectedCategory && (
              <View style={[styles.filterChip, { backgroundColor: theme.orange }]}>
                <Text style={styles.filterChipText}>Category: {selectedCategory}</Text>
              </View>
            )}
            {selectedFilter && (
              <View style={[styles.filterChip, { backgroundColor: theme.orange }]}>
                <Text style={styles.filterChipText}>{selectedFilter}</Text>
              </View>
            )}
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Hero Background with Centered Content */}
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={require('@/assets/images/Rectangle 4(1).png')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <ThemedText type="subtitle" style={{ color: theme.background }}>
              Welcome to Our Store
            </ThemedText>
            <Text style={styles.heroText}>
              Shop Amazing Products at Affordable Prices
            </Text>
            <TouchableOpacity style={styles.heroButton}>
              <Link 
                href={{
                  pathname: '/ProductPage',
                  params: {
                    search: searchQuery,
                    category: selectedCategory,
                    filter: selectedFilter,
                  }
                }} 
                style={styles.heroButtonText}
              >
                Shop Now
              </Link>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* Search Results Summary */}
      {(searchQuery || selectedCategory || selectedFilter) && (
        <View style={styles.resultsSummary}>
          <Text style={[styles.resultsText, { color: theme.text }]}>
            {searchQuery && `Searching for "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedFilter && ` sorted by ${selectedFilter}`}
          </Text>
        </View>
      )}
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
    paddingTop: 5,
  },
  heroButton: {
    backgroundColor: '#F93A01',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFiltersContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: '500',
  },
  resultsSummary: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f4fd',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});