import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';

interface Props {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
   helperText?: string;
}

export const SelectDropdown = ({ label, value, options, onSelect, helperText }: Props) => {
     const colorScheme = useColorScheme();
      const theme = Colors[colorScheme ?? 'light'];
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}<Text style={{ color: 'red' }}>*</Text></Text>
      <Pressable style={styles.dropdown} onPress={() => console.log('Open picker')}>
        <Text style={{color:Colors.light.placeholder}}>{value || `Select ${label}`}</Text>
        <Text><Feather name='chevron-down' size={20} color={Colors.light.lightgray} /></Text>
      </Pressable>
       {helperText && (
              <Text style={[styles.helperText, { color: theme.gray }]}>{helperText}</Text>
            )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { marginBottom: 6, fontWeight: '600',
    fontSize: 12,
    fontFamily: 'PTSerif-Regular',
    color:Colors.light.text },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0.4,
    borderColor: Colors.light.gray,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
   
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'PTSerif-Regular',
  },
});
