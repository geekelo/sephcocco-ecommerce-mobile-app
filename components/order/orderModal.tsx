import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import OrderSummary from './orderSummary';
import PaymentMethod from '../billing/paymentMethod';
import { Product } from '../types/types';

interface OrderModalProps {
  product: Product;
  visible: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ product, visible, onClose }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [address, setAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orderSummary' | 'paymentMethod'>('orderSummary');

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Payment</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close modal" style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'orderSummary' && styles.activeTabButton]}
              onPress={() => setActiveTab('orderSummary')}
            >
              <Text style={[styles.tabText, activeTab === 'orderSummary' && styles.activeTabText]}>
                Order Summary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'paymentMethod' && styles.activeTabButton]}
              onPress={() => setActiveTab('paymentMethod')}
            >
              <Text style={[styles.tabText, activeTab === 'paymentMethod' && styles.activeTabText]}>
                Payment Method
              </Text>
            </TouchableOpacity>
          </View>
<ScrollView
  contentContainerStyle={styles.scrollContainer}
  showsVerticalScrollIndicator={true}
>
  {activeTab === 'orderSummary' ? (
    <OrderSummary
      product={product}
      quantity={quantity}
      setQuantity={setQuantity}
      address={address}
      setAddress={setAddress}
    />
  ) : (
    <PaymentMethod product={product} quantity={quantity} address={address} />
  )}
</ScrollView>
 

        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
  },
  scrollContainer: {
  padding: 16,
  paddingBottom: 40, // extra padding for keyboard or bottom spacing
},

 modalContainer: {
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  height: '95%',
  width: '95%',
  alignSelf: 'center',
 
  flexDirection: 'column',
  // Add flex: 1 or remove fixed height for better layout (try both)
},


  header: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: '60%',
    marginTop: -5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#10b981', // lime-500 or your primary color
  },
  tabText: {
    fontSize: 16,
    color: '#718096', // gray-600
  },
  activeTabText: {
    color: '#10b981',
    fontWeight: '700',
  },
  body: {
    padding: 16,
   
  },
});

export default OrderModal;
