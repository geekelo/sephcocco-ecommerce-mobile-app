import React, { useState } from 'react';
import { Image } from 'expo-image';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import InputField from '@/components/ui/InputField';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import { Link, router } from 'expo-router';
import { useSignup } from '@/mutation/useAuth';
import { useRequestEmailConfirmationToken } from '@/mutation/useEmail'; // 👈 import
import LoadingSpinner from '@/components/common/loadingSpinner';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const { mutate: signup, isPending } = useSignup();
  const { mutate: requestToken, isPending: isRequesting } =
    useRequestEmailConfirmationToken();

  const handleSignup = () => {
    if (!name || !address || !email || !phoneNumber || !whatsappNumber) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    signup(
      {
        name,
        address,
        email,
        phone_number: phoneNumber,
        whatsapp_number: whatsappNumber,
        role: 'user',
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Success',
            'Account created successfully. Requesting confirmation email...'
          );

          // 👇 Request token immediately
          requestToken(email, {
            onSuccess: () => {
              Alert.alert(
                '📩 Email Sent',
                'A confirmation token has been sent to your email.'
              );

              // now route to confirm screen
              router.push({
                pathname: '/auth/confirm',
                params: { email },
              });
            },
            onError: (error: any) => {
              Alert.alert(
                '❌ Error',
                error?.response?.data?.message || 'Failed to send confirmation email'
              );
            },
          });
        },
        onError: (error: any) => {
          Alert.alert(
            'Error',
            error?.response?.data?.message || 'Failed to sign up'
          );
        },
      }
    );
  };

  if (isPending || isRequesting) {
    return <LoadingSpinner />;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={require('@/assets/images/SEPHCOCO LOUNGE 3.png')}
              style={styles.logo}
            />
          </View>
          <ThemedText type="subtitle" style={{ color: theme.text, textAlign: 'center' }}>
            Sign Up
          </ThemedText>
          <View style={styles.form}>
            <InputField label="Name" value={name} onChangeText={setName} placeholder="Enter your name" />
            <InputField label="Address" value={address} onChangeText={setAddress} placeholder="Enter your address" />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <InputField
              label="WhatsApp Number"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
              placeholder="Enter WhatsApp number"
              keyboardType="phone-pad"
            />

            <CustomButton
              text={isPending || isRequesting ? 'Processing...' : 'Sign Up Now'}
              onPress={handleSignup}
              disabled={isPending || isRequesting}
            />

            <Text style={[styles.loginText, { color: theme.text }]}>
              Already have an account?{' '}
              <Link style={[styles.loginLink, { color: theme.success }]} href="/auth/signIn">
                Sign in
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 20,
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
    paddingTop: 40,
  },
  loginText: {
    textAlign: 'center',
    fontFamily: 'PTSerif-Regular',
  },
  loginLink: {
    fontWeight: 'bold',
    fontFamily: 'PTSerif-Regular',
    textDecorationStyle: 'dashed',
    textDecorationLine: 'underline',
  },
});
