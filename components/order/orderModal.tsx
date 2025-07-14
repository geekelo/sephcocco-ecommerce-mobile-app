import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import OrderSummary from './orderSummary';
import PaymentMethod from '../billing/paymentMethod';
import { Product } from '../types/types';

interface OrderModalProps {
  product: Product;
  visible: boolean;
  onClose: () => void;
  outlet: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ product, visible, onClose, outlet }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [address, setAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orderSummary' | 'paymentMethod'>('orderSummary');

  const extractOrderIds = () => {
  const maybeOrders = (product as any)?.products;

  if (Array.isArray(maybeOrders) && maybeOrders.length > 0) {
    // Extract all order_numbers from each order
    return maybeOrders.map((order: any) => order.order_number).filter(Boolean);
  }

  // Single product with one order
  return [(product as any)?.order_number].filter(Boolean);
};


  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
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
                Payment
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'orderSummary' ? (
            <OrderSummary
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              address={address}
              setAddress={setAddress}
              outlet={outlet}
            />
          ) : (
            <PaymentMethod
              product={product}
              quantity={quantity}
              address={address}
              orderIds={extractOrderIds()}
            />
          )}
        </View>
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
  modalContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    height: '95%',
    width: '95%',
    alignSelf: 'center',
    overflow: 'hidden',
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
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 16,
    color: '#718096',
  },
  activeTabText: {
    color: '#10b981',
    fontWeight: '700',
  },
});

export default OrderModal;
