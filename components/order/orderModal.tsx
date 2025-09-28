import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import OrderSummary from './orderSummary';
import PaymentMethod from '../billing/paymentMethod';
import { Order } from '../types/types';
import { getUser } from '@/lib/tokenStorage';
import { useUpdateOrder } from '@/mutation/useOrders';

interface OrderModalProps {
  orders: Order[];
  visible: boolean;
  onClose: () => void;
  outlet: string;
  orderId?: string | null;
  initialOrderData?: {
    address: string;
    phone_number: string;
    additional_notes: string;
  };
}

const OrderModal: React.FC<OrderModalProps> = ({
  orders,
  visible,
  onClose,
  outlet,
  orderId,
  initialOrderData,
}) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [orderData, setOrderData] = useState({
    address: '',
    phone_number: '',
    additional_notes: '',
  });
  const [activeTab, setActiveTab] = useState<'orderSummary' | 'paymentMethod'>('orderSummary');
  const [user, setUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Initialize update order hook
  const { mutate: updateOrder, isPending: isUpdatePending } = useUpdateOrder(outlet);

  console.log('OrderModal received orders:', orders);
  console.log('OrderModal received orderId:', orderId);

  // Initialize quantities when orders change or orderId is provided
  useEffect(() => {
    if (orderId) {
      // For "Buy Now" scenario with specific order ID
      setQuantities(prev => ({
        ...prev,
        [orderId]: 1
      }));
    } else if (orders && orders.length > 0) {
      // For cart/multiple orders scenario
      const initialQuantities: { [key: string]: number } = {};
      orders.forEach((order) => {
        if (order?.id) {
          initialQuantities[order.id] = order.quantity || 1;
        }
      });
      setQuantities(initialQuantities);
    }
  }, [orders, orderId]);

  // Initialize order data when modal opens
  useEffect(() => {
    if (visible && initialOrderData) {
      setOrderData(initialOrderData);
    }
  }, [visible, initialOrderData]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const extractOrderIds = () => {
    // If we have a specific orderId from "Buy Now", use that
    if (orderId) {
      return [orderId];
    }
    // Otherwise, extract from orders array
    if (!Array.isArray(orders)) return [];
    return orders.map((order) => order?.id).filter(Boolean);
  };

  const handleQuantityChange = async (orderIdToUpdate: string, newQuantity: number) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    if (newQuantity < 1) {
      Alert.alert('Invalid Quantity', 'Quantity must be at least 1.');
      return;
    }

    // Find the order to get product_id
    let order;
    let productId;
    
    if (orderId && orderIdToUpdate === orderId) {
      // For "Buy Now" scenario, use the first order from the orders array (which is the product)
      order = orders[0];
      productId = order?.product_id || order?.id; // Use product_id if available, else fallback to id
    } else {
      // For cart scenario
      order = orders.find(o => o.id === orderIdToUpdate);
      productId = order?.product_id;
    }

    if (!order) {
      Alert.alert('Error', 'Order not found.');
      return;
    }

    setIsUpdating(true);

    // Optimistically update the UI
    setQuantities(prev => ({
      ...prev,
      [orderIdToUpdate]: newQuantity
    }));

    // Update the order in the backend
    updateOrder(
      {
        id: orderIdToUpdate,
        user_id: user.id,
        product_id: productId,
        quantity: newQuantity,
        outlet: outlet,
        ...orderData, // Include the current order data
      },
      {
        onSuccess: () => {
          console.log(`✅ Successfully updated quantity for order ${orderIdToUpdate} to ${newQuantity}`);
          setIsUpdating(false);
        },
        onError: (error) => {
          console.error('❌ Failed to update order quantity:', error);
          // Revert the optimistic update
          setQuantities(prev => ({
            ...prev,
            [orderIdToUpdate]: order.quantity || 1
          }));
          setIsUpdating(false);
          Alert.alert(
            'Update Failed', 
            'Failed to update quantity. Please try again.',
            [{ text: 'OK', style: 'default' }]
          );
        },
      }
    );
  };

  const handleOrderDataChange = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateOrderData = () => {
    if (!orderData.address.trim()) {
      Alert.alert(
        'Address Required',
        'Please enter a delivery address before proceeding to payment.',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }

    if (!orderData.phone_number.trim()) {
      Alert.alert(
        'Phone Number Required',
        'Please enter your phone number before proceeding to payment.',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    if (!phoneRegex.test(orderData.phone_number.trim())) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid phone number.',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateOrderData()) {
      return;
    }

    if (isUpdating || isUpdatePending) {
      Alert.alert(
        'Please Wait',
        'Please wait for quantity updates to complete before proceeding.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    console.log('Proceeding to payment with order IDs:', extractOrderIds());
    console.log('Current quantities:', quantities);
    console.log('Order data:', orderData);
    setActiveTab('paymentMethod');
  };

  // Reset state when modal closes
  const handleClose = () => {
    setQuantities({});
    setOrderData({
      address: '',
      phone_number: '',
      additional_notes: '',
    });
    setActiveTab('orderSummary');
    onClose();
  };

  // Get current quantity for an order
  const getCurrentQuantity = (orderIdToCheck: string) => {
    return quantities[orderIdToCheck] || 1;
  };

  // Get total quantity across all orders
  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0) || orders.length;
  };

  // Create orders with updated quantities for payment
  const getOrdersWithUpdatedQuantities = () => {
    if (orderId) {
      // For "Buy Now" scenario, use the product data and created order ID
      return orders.map(order => ({
        ...order,
        id: orderId, // Use the created order ID
        quantity: getCurrentQuantity(orderId)
      }));
    }
    
    // For normal cart scenario
    return orders.map(order => ({
      ...order,
      quantity: getCurrentQuantity(order.id)
    }));
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
                if (!validateOrderData()) {
                  return;
                }
                if (isUpdating || isUpdatePending) {
                  Alert.alert(
                    'Please Wait',
                    'Please wait for quantity updates to complete.',
                    [{ text: 'OK', style: 'default' }]
                  );
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
                orders={getOrdersWithUpdatedQuantities()}
                quantities={quantities}
                onQuantityChange={handleQuantityChange}
                orderData={orderData}
                onOrderDataChange={handleOrderDataChange}
                outlet={outlet}
                products={getOrdersWithUpdatedQuantities()}
                onProceedToPayment={handleProceedToPayment}
                isUpdating={isUpdating || isUpdatePending}
              />
            ) : (
              <PaymentMethod
                products={getOrdersWithUpdatedQuantities()}
                quantity={getTotalQuantity()}
                address={orderData.address}
                orderIds={extractOrderIds()}
                
              />
            )}
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OrderModal

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#2d3748' 
  },
  modalContainer: { 
    backgroundColor: '#f7fafc', 
    flex: 1, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    overflow: 'hidden' 
  },
  header: { 
    backgroundColor: '#2d3748', 
    paddingVertical: 20, 
    paddingHorizontal: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#fff' 
  },
  closeButton: { 
    position: 'absolute', 
    right: 16, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 20, 
    padding: 8, 
    zIndex: 10 
  },
  tabBar: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 16, 
    alignItems: 'center', 
    backgroundColor: 'white' 
  },
  activeTabButton: { 
    borderBottomWidth: 3, 
    borderBottomColor: '#10b981', 
    backgroundColor: '#f0fdf4' 
  },
  tabText: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#718096' 
  },
  activeTabText: { 
    color: '#10b981', 
    fontWeight: '700' 
  },
  tabContentContainer: { 
    flex: 1, 
    backgroundColor: '#f7fafc' 
  },
});