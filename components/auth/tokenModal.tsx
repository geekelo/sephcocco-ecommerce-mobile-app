import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import AuthModal from './authModal';
import CustomButton from '@/components/ui/CustomButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (token: string) => void;
   loading?: boolean;
};

const TokenModal = ({ visible, onClose, onSubmit, loading }: Props) => {
  const [token, setToken] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (visible) {
      setToken(['', '', '', '', '', '']);
      // Focus first input when modal opens
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    }
  }, [visible]);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newToken = [...token];
      newToken[index] = text;
      setToken(newToken);

      // Focus next input if exists
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    } else if (text === '') {
      // Clear current input
      const newToken = [...token];
      newToken[index] = '';
      setToken(newToken);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (token[index] === '') {
        // Move focus to previous input if current is empty
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        // Clear current input on backspace
        const newToken = [...token];
        newToken[index] = '';
        setToken(newToken);
      }
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
         text={loading ?  <ActivityIndicator />  : 'Continue'}
        onPress={() => onSubmit(joinedToken)}
      
        disabled={loading || token.length !== 6}

      />
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
});

export default TokenModal;
