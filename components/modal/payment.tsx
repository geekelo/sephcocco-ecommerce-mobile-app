// components/modals/PaymentModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '../ui/CustomButton';
import { Colors } from '@/constants/Colors';
import { SuccessModal } from './sucess';

type PaymentDetail = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  details: PaymentDetail[];
  onConfirm?: () => void;
  buttonText?: string;
};

const PaymentModal = ({ visible, onClose, title, details, onConfirm, buttonText = 'Confirm Payment' }: Props) => {
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Static Header */}
          <View style={styles.header}>
            <Image source={require('@/assets/images/SEPHCOCO LOUNGE 3.png')} style={styles.logo} />
            <TouchableOpacity onPress={onClose} style={styles.iconCircle}>
              <Ionicons name="close" size={20} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
            {title}
          </ThemedText>

          {details.map((item) => (
            <View style={styles.row} key={item.label}>
              <ThemedText fontFamily="Raleway-Regular" style={styles.label}>
                {item.label}
              </ThemedText>
              <ThemedText fontFamily="Raleway-Regular" style={styles.value}>
                {item.value}
              </ThemedText>
            </View>
          ))}

          <CustomButton text={buttonText} onPress={onConfirm || onClose} style={styles.button} />

        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 8,
    padding: 34,
    alignItems: 'center',
    elevation: 4,
    marginHorizontal:'auto'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 16,
    borderWidth: 0.4,
    borderColor: Colors.light.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 24,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 6,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
  },
  value: {
    fontWeight: '400',
    fontSize: 13,
  },
  button: {
    width: '100%',
    marginTop: 24,
  },
});
