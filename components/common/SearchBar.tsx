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
  searchQuery?: string; // ✅ Added searchQuery prop
}

const primaryFilters = [
  'Price: Low to High',
  'Price: High to Low',
  'Newest First',
  'Rating',
  'Most Liked', // ✅ Added this filter option
  'Alphabetical', // ✅ Added this filter option
];

export function SearchBar({
  onFilterToggle,
  filterOpen,
  onSearchChange,
  onFilterSelect,
  onCategorySelect,
  searchQuery = '', // ✅ Added with default value
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
    setIsCategoryOpen(false); // ✅ Close category dropdown after selection
  };

  // ✅ Close category dropdown when main filter dropdown closes
  React.useEffect(() => {
    if (!filterOpen) {
      setIsCategoryOpen(false);
    }
  }, [filterOpen]);

  return (
    <>
      <View style={themedStyles.searchContainer}>
        <Feather name="search" size={20} color={theme.text} style={styles.searchIcon} />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={theme.text}
          style={themedStyles.searchInput}
          onChangeText={onSearchChange}
          value={searchQuery} // ✅ Controlled input with current search value
        />
        <View style={themedStyles.verticalDivider} />
        <TouchableOpacity style={themedStyles.filterButton} onPress={onFilterToggle}>
          <Text style={[styles.filterText, { color: theme.gray }]}>Filter By</Text>
          <Entypo 
            name={filterOpen ? "chevron-up" : "chevron-down"} // ✅ Dynamic chevron direction
            size={14} 
            color={theme.gray} 
          />
        </TouchableOpacity>
      </View>

      {filterOpen && (
        <View style={themedStyles.dropdown}>
          {/* Regular filters */}
          {primaryFilters.map((filter, idx) => (
            <TouchableOpacity 
              key={idx} 
              onPress={() => handleFilterClick(filter)}
              style={styles.dropdownButton} // ✅ Added better touch target
            >
              <Text style={themedStyles.dropdownItem}>{filter}</Text>
            </TouchableOpacity>
          ))}

          {/* Category Toggle */}
          <TouchableOpacity
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}
            style={[styles.categoryToggle, styles.dropdownButton]} // ✅ Consistent styling
          >
            <Text style={themedStyles.dropdownItem}>Categories</Text>
            <Entypo
              name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* Category List */}
          {isCategoryOpen && (
            <View style={styles.categoryList}>
              <ScrollView showsVerticalScrollIndicator={true}>
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.orange} />
                    <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
                  </View>
                )}
                
                {error && (
                  <Text style={[styles.errorText, { color: 'red' }]}>
                    Failed to load categories
                  </Text>
                )}
                
                {categories && categories.length === 0 && !isLoading && (
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    No categories available
                  </Text>
                )}
                
                {categories?.map((cat: { name: string }, idx: number) => (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => handleCategoryClick(cat.name)}
                    style={styles.categoryItem}
                  >
                    <Text style={[themedStyles.dropdownItem, styles.categoryItemText]}>
                      • {cat.name}
                    </Text>
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
    fontWeight: '500',
  },
  categoryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 4,
  },
  dropdownButton: {
    paddingVertical: 4,
  },
  categoryList: {
    maxHeight: 200,
    marginTop: 4,
  },
  categoryItem: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  categoryItemText: {
    paddingLeft: 12,
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 14,
    fontStyle: 'italic',
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
      right: screenWidth * 0.05,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      width: screenWidth * 0.6,
      backgroundColor: theme.background, // ✅ Use theme background
      borderColor: theme.inputBorder, // ✅ Use theme border color
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5, // ✅ Increased elevation for better visibility
      zIndex: 9999,
    },
    dropdownItem: {
      paddingVertical: 6,
      fontSize: 16,
      color: theme.text,
    },
  });