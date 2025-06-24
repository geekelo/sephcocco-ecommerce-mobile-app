import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useOutlet } from '@/context/outletContext';
import { useProductCategories } from '@/mutation/useCategory';

interface SearchBarProps {
  onFilterToggle?: () => void;
  onFilterSelect?: (option: string) => void; // Add this
  filterOpen: boolean;
  onSearchChange?: (text: string) => void;
  filterOptions: string[];
}


export function SearchBar({
  onFilterToggle,
  filterOpen,
  onSearchChange,
  onFilterSelect,
  filterOptions,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const themedStyles = getThemedStyles(theme);
  const { activeOutlet } = useOutlet(); // ✅ dynamic activeOutlet

  const { data: categories, isLoading, error } = useProductCategories(activeOutlet ?? "");


  console.log('Fetched Categories:', categories);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

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

      {/* Dropdown menu */}
     {filterOpen && (
  <View style={themedStyles.dropdown}>
    {filterOptions.map((option, idx) => (
      <TouchableOpacity
        key={idx}
        onPress={() => onFilterSelect?.(option)}
      >
        <Text style={themedStyles.dropdownItem}>{option}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}

    </>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  searchIcon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 10,
    marginRight: 4,
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
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 1,
      marginHorizontal: screenWidth * 0.05, // 5% of screen width
      marginTop: 20,
      borderWidth: 0.3,
      backgroundColor: theme.background,
      borderColor: theme.inputBorder,
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
      width: screenWidth * 0.3, // 30% of screen width
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
  elevation: 0,  // Android shadow
  zIndex: 9999,   // iOS stacking
},


    dropdownItem: {
      paddingVertical: 6,
      fontSize: 16,
      color: theme.text,
    },
  });
