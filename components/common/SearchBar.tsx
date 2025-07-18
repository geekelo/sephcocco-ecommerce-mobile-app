import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useOutlet } from '@/context/outletContext';
import { useProductCategories } from '@/mutation/useCategory';

const screenWidth = Dimensions.get('window').width;

interface SearchBarProps {
  onFilterToggle?: () => void;
  onCategorySelect?: (category: string) => void;
  onSearchChange?: (text: string) => void;
  onFilterSelect?: (filter: string) => void;
  filterOpen: boolean;
}

const primaryFilters = [
  
  'Price: Low to High',
  'Price: High to Low',
  'Newest First',
  'Rating',
];

export function SearchBar({
  onFilterToggle,
  filterOpen,
  onSearchChange,
  onFilterSelect,
  onCategorySelect,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const themedStyles = getThemedStyles(theme);
  const { activeOutlet } = useOutlet();
  const { data: categories, isLoading, error } = useProductCategories(activeOutlet ?? '');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleFilterClick = (filter: string) => {
    onFilterSelect?.(filter);
    onFilterToggle?.();
  };

  const handleCategoryClick = (category: string) => {
    onCategorySelect?.(category);
    onFilterToggle?.();
  };

  return (
    <>
      <View style={themedStyles.searchContainer}>
        <Feather name="search" size={20} color={theme.text} style={styles.searchIcon} />
        <TextInput
          placeholder="Search..."
          placeholderTextColor={theme.text}
          style={themedStyles.searchInput}
          onChangeText={onSearchChange}
        />
        <View style={themedStyles.verticalDivider} />
        <TouchableOpacity style={themedStyles.filterButton} onPress={onFilterToggle}>
          <Text style={[styles.filterText, { color: theme.gray }]}>Filter By</Text>
          <Entypo name="chevron-down" size={14} color={theme.gray} />
        </TouchableOpacity>
      </View>

      {filterOpen && (
        <View style={themedStyles.dropdown}>
          {/* Regular filters */}
          {primaryFilters.map((filter, idx) => (
            <TouchableOpacity key={idx} onPress={() => handleFilterClick(filter)}>
              <Text style={themedStyles.dropdownItem}>{filter}</Text>
            </TouchableOpacity>
          ))}

          {/* Category Toggle */}
          <TouchableOpacity
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}
            style={styles.categoryToggle}
          >
            <Text style={themedStyles.dropdownItem}>Category</Text>
            <Entypo
              name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* Category List */}
          {isCategoryOpen && (
            <View style={{ maxHeight: 200 }}>
              <ScrollView>
                {isLoading && <ActivityIndicator size="small" color={theme.orange} />}
                {error && <Text style={{ color: 'red' }}>Failed to load categories</Text>}
                {categories?.map((cat: { name: string }, idx: number) => (
                  <TouchableOpacity key={idx} onPress={() => handleCategoryClick(cat.name)}>
                    <Text style={[themedStyles.dropdownItem, { paddingLeft: 12 }]}>• {cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchIcon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 10,
    marginRight: 4,
  },
  categoryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
});

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 5,
      paddingHorizontal: 12,
      height: 50,
      marginHorizontal: screenWidth * 0.05,
      marginTop: 20,
      borderWidth: 0.3,
      backgroundColor: theme.background,
      borderColor: theme.inputBorder,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    verticalDivider: {
      width: 0.5,
      height: '100%',
      backgroundColor: theme.inputBorder,
      marginHorizontal: 8,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      width: screenWidth * 0.3,
    },
    dropdown: {
      position: 'absolute',
      top: 80,
      right: 0,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      width: screenWidth * 0.6,
      backgroundColor: '#fff',
      borderColor: '#ccc',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
      zIndex: 9999,
    },
    dropdownItem: {
      paddingVertical: 6,
      fontSize: 16,
      color: theme.text,
    },
  });
