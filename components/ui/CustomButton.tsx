import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props {
  text: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  icon?: React.ReactNode; // ✅ Add icon prop
}

const CustomButton: React.FC<Props> = ({ text, onPress, style, textStyle, disabled, icon }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? theme.placeholder : theme.orange },
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.buttonText, disabled && styles.disabledText, textStyle]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 6.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'PTSerif-Regular',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#eee',
  },
});

export default CustomButton;
