import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type CustomOutlineButtonProps = {
  title: string;
  color?: string; // outline and text color
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function CustomOutlineButton({
  title,
  color = '#FF6C00', // default orange
  onPress,
  style,
  textStyle,
}: CustomOutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { borderColor: color },
        pressed && { backgroundColor: color + '20' }, // slight transparent bg on press
        style,
      ]}
    >
      <Text style={[styles.btnText, { color }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  btnText: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
