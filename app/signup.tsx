import { Image } from 'expo-image';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import InputField from '@/components/ui/InputField';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Link, router } from 'expo-router';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
   
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.imageWrapper}>
        <Image
          source={require('@/assets/images/SEPHCOCO LOUNGE 3.png')}
          style={styles.logo}
        />
      </View>
      <ThemedText type="subtitle"  style={{ color: theme.text, textAlign:'center' }}>Sign Up</ThemedText>
      <View style={styles.form}>
        
        <InputField label="Phone Number" placeholder="Enter phone number" />
        <InputField label="WhatsApp Number" placeholder="Enter WhatsApp number" />
        <InputField label="Create Password" placeholder="Enter password" secureTextEntry />
        <InputField label="Confirm Password" placeholder="Confirm password" secureTextEntry />
        <CustomButton text="Sign Up Now" onPress={() => {router.push('/storeSelection')}} />
        <Text style={[styles.loginText, { color: theme.text }]}>
          Already have an account? <Link style={[styles.loginLink, { color: theme.success }]} href="/signIn">Sign in</Link>
        </Text>
      </View>
    </ThemedView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 30,
    gap: 20,
    paddingVertical:60,
    
    
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    height: 67,
    width: 64,
  },
  form: {
    flex: 1,
    gap: 10,
    paddingTop:40
  },
  loginText: {
    textAlign: 'center',
     fontFamily: 'PTSerif-Regular',
   
  },
  loginLink: {
    fontWeight: 'bold',
     fontFamily: 'PTSerif-Regular',
     textDecorationStyle:'dashed',
     textDecorationLine:'underline'
  },
});
