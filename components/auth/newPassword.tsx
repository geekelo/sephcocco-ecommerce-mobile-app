import React, { useState } from 'react';
import AuthModal from './authModal';
import InputField from '@/components/ui/InputField';
import CustomButton from '@/components/ui/CustomButton';
import { ActivityIndicator } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (password: string, password_confirmation: string) => void;
   loading?: boolean;
};

const NewPasswordModal = ({ visible, onClose, onSubmit, loading }: Props) => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  return (
    <AuthModal
      visible={visible}
      title="Set New Password"
      description="Enter and confirm your new password"
      onClose={onClose}
    >
      <InputField
        label="Password"
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <InputField
        label="Confirm Password"
        placeholder="********"
        secureTextEntry
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
      />
      <CustomButton
       text={loading ?  <ActivityIndicator />  : 'Reset Password'}
        onPress={() => onSubmit(password, passwordConfirmation)}
        disabled={loading || !password || !passwordConfirmation} // disable if loading or empty email
      />
    </AuthModal>
  );
};

export default NewPasswordModal;
