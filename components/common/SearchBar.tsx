import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface SearchBarProps {
  onFilterToggle?: () => void;
  filterOpen: boolean;
  onSearchChange?: (text: string) => void;
  filterOptions: string[];
}

export function SearchBar({
  onFilterToggle,
  filterOpen,
  onSearchChange,
  filterOptions,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const themedStyles = getThemedStyles(theme);

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
        <TouchableOpacity style={styles.filterButton} onPress={onFilterToggle}>
          <Text style={[styles.filterText, { color: theme.gray }]}>Filter By</Text>
          <Entypo name="chevron-down" size={14} color={theme.gray} />
        </TouchableOpacity>
      </View>

      {/* Dropdown menu */}
      {filterOpen && (
        <View style={themedStyles.dropdown}>
          {filterOptions.map((option, idx) => (
            <Text key={idx} style={themedStyles.dropdownItem}>
              {option}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchIcon: {
    marginRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: 220,
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
      marginHorizontal: 40,
      marginTop: 20,
      borderWidth: 0.2,
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
      backgroundColor: theme.border,
      marginHorizontal: 8,
    },
    dropdown: {
      position: 'absolute',
      top: 90,
      right: 10,
      borderRadius: 8,
      borderWidth: 0.5,
      padding: 12,
      width: '50%',
      backgroundColor: theme.card, // change to theme.dropdown if defined
      borderColor: theme.border,
      zIndex: 1000,
      elevation: 10,
    },
    dropdownItem: {
      paddingVertical: 6,
      fontSize: 16,
      color: theme.text,
    },
  });
