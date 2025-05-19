/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    orange:'#F93A01',
    inputBorder:'rgba(0, 0, 0, 0.66)',
    success:'#16642B',
    placeholder:'rgba(0, 0, 0, 0.63)',
    gray:'#545454',
    border:'rgba(0, 0, 0, 0.15)',
    borderorange:'rgba(249, 58, 1, 0.41)',
    pink:'rgba(255, 167, 140, 0.11)'
  },
  dark: {
    text: '#FFF',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    orange:'#F93A01',
      inputBorder:'rgba(255, 255, 255, 0.66)',
      success:'#16642B',
      placeholder:'rgba(255, 255, 255, 0.63)',
      gray:'	#222222',
      border:'rgba(255, 255, 255, 0.34)',
       borderorange:'rgba(249, 58, 1, 0.41)',
       pink:'rgba(255, 167, 140, 0.11)'
  },
};
