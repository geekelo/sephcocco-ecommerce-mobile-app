import React from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '../ThemedText';
interface Props extends TextInputProps {
  label?: string;
  required?: boolean;
}

const InputField: React.FC<Props> = ({ label, required = false, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.wrapper}>
      {label && (
        <ThemedText type="default" style={[styles.label, { color: theme.text }]}>
          {label} {required && <Text style={{ color: 'red' }}>*</Text>}
        </ThemedText>
      )}
      <TextInput
        style={[styles.input, {
          borderColor: theme.inputBorder,
          color: theme.text,
        }]}
        placeholderTextColor={theme.placeholder}
        {...props}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
    fontSize:12,
     fontFamily: 'PTSerif-Regular',
  },
  input: {
    borderWidth:0.33,
    padding: 16,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  placeholder:{
    fontSize:8
  }
});

export default InputField;
