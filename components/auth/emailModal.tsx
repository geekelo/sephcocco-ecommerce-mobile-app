import React, { useState } from 'react';
import AuthModal from './authModal';
import InputField from '@/components/ui/InputField';
import CustomButton from '@/components/ui/CustomButton';
import { ActivityIndicator } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  loading?: boolean;
};

const EmailModal = ({ visible, onClose, onSubmit, loading = false }: Props) => {
  const [email, setEmail] = useState('');

  return (
    <AuthModal
      visible={visible}
      title="Reset Password"
      description="Enter the email linked to your account"
      onClose={onClose}
    >
      <InputField
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading} // prevent typing while loading
      />
      <CustomButton
        text={loading ? <ActivityIndicator /> : 'Send Reset Code'}
        onPress={() => onSubmit(email)}
        disabled={loading || !email} // disable if loading or empty email
      />
    </AuthModal>
  );
};

export default EmailModal;
