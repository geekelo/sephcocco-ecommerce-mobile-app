import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props {
  text: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;      // Optional button container style
  textStyle?: StyleProp<TextStyle>;  // Optional text style, including color
}

const CustomButton: React.FC<Props> = ({ text, onPress, style, textStyle }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.orange }, style]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 6.4,
    alignItems: 'center',
    cursor: 'pointer',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'PTSerif-Regular',
    color: 'white', // Default color, can be overridden via `textStyle`
  },
});

export default CustomButton;
