import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import AuthModal from './authModal';
import CustomButton from '@/components/ui/CustomButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (token: string) => void;
  loading?: boolean;
  email: string;
  onResend: () => void;
  resendLoading?: boolean;
};

const RESEND_DELAY = 30; // seconds

const TokenModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
  onResend,
  resendLoading,
  email,
}: Props) => {
  const [token, setToken] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(RESEND_DELAY);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (visible) {
      setToken(['', '', '', '', '', '']);
      setTimer(RESEND_DELAY);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [visible]);

  useEffect(() => {
   let interval: ReturnType<typeof setInterval>;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (timer === 0 && !resendLoading) {
      onResend();
      setTimer(RESEND_DELAY);
    }
  };

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newToken = [...token];
      newToken[index] = text;
      setToken(newToken);
      if (index < 5) inputsRef.current[index + 1]?.focus();
    } else if (text === '') {
      const newToken = [...token];
      newToken[index] = '';
      setToken(newToken);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (token[index] === '' && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      const newToken = [...token];
      newToken[index] = '';
      setToken(newToken);
    }
  };

  const joinedToken = token.join('');
  const isDisabled = token.some((digit) => digit === '');

  return (
    <AuthModal
      visible={visible}
      title="Enter Code"
      description="Check your email and enter the 6-digit code"
      onClose={onClose}
    >
      <View style={styles.otpContainer}>
        {token.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            returnKeyType="done"
            textContentType="oneTimeCode"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <CustomButton
        text={loading ? <ActivityIndicator /> : 'Continue'}
        onPress={() => onSubmit(joinedToken)}
        disabled={loading || isDisabled}
      />

      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={styles.resendText}>
            You can resend the code in <Text style={styles.countdown}>{timer}s</Text>
          </Text>
        ) : (
          <Text style={styles.resendText}>
            Didn’t get the code?{' '}
            <Text onPress={handleResend} style={styles.resendLink}>
              {resendLoading ? 'Sending...' : 'Resend'}
            </Text>
          </Text>
        )}
      </View>
    </AuthModal>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 20,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#333',
  },
  resendLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  countdown: {
    fontWeight: 'bold',
    color: '#555',
  },
});

export default TokenModal;
