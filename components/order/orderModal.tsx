import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import OrderSummary from './orderSummary';
import PaymentMethod from '../billing/paymentMethod';
import { Order } from '../types/types';

interface OrderModalProps {
  orders: Order[]; // ✅ updated to multiple orders
  visible: boolean;
  onClose: () => void;
  outlet: string;
}

const OrderModal: React.FC<OrderModalProps> = ({
  orders,
  visible,
  onClose,
  outlet,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [address, setAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orderSummary' | 'paymentMethod'>('orderSummary');

  console.log('OrderModal received orders:',orders);
const extractOrderIds = () => {
  if (!Array.isArray(orders)) return [];
  return orders.map((order) => order?.id).filter(Boolean);
};


  const handleProceedToPayment = () => {
    if (!address.trim()) {
      alert('Please enter a delivery address before proceeding to payment.');
      return;
    }
    console.log('Proceeding to payment with order IDs:', extractOrderIds());
    setActiveTab('paymentMethod');
  };

  // Reset state when modal closes
  const handleClose = () => {
    setQuantity(1);
    setAddress('');
    setActiveTab('orderSummary');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Payment</Text>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'orderSummary' && styles.activeTabButton]}
              onPress={() => setActiveTab('orderSummary')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'orderSummary' && styles.activeTabText]}>
                Order Summary
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'paymentMethod' && styles.activeTabButton]}
              onPress={() => {
                if (!address.trim()) {
                  alert('Please enter a delivery address first.');
                  return;
                }
                setActiveTab('paymentMethod');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'paymentMethod' && styles.activeTabText]}>
                Payment
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.tabContentContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {activeTab === 'orderSummary' ? (
              <OrderSummary
                orders={orders} // ✅ pass all selected orders
                quantity={quantity}
                setQuantity={setQuantity}
                address={address}
                setAddress={setAddress}
                outlet={outlet}
                products={orders}
                onProceedToPayment={handleProceedToPayment}
              />
            ) : (
              <PaymentMethod
                products={orders} // ✅ pass all selected orders
                quantity={quantity}
                address={address}
                orderIds={extractOrderIds()}
              />
            )}
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OrderModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d3748' },
  modalContainer: { backgroundColor: '#f7fafc', flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  header: { backgroundColor: '#2d3748', paddingVertical: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  closeButton: { position: 'absolute', right: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8, zIndex: 10 },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: 'white' },
  activeTabButton: { borderBottomWidth: 3, borderBottomColor: '#10b981', backgroundColor: '#f0fdf4' },
  tabText: { fontSize: 16, fontWeight: '500', color: '#718096' },
  activeTabText: { color: '#10b981', fontWeight: '700' },
  tabContentContainer: { flex: 1, backgroundColor: '#f7fafc' },
});
