import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order } from '../types/types';

interface OrderSummaryProps {
  orders: Order[];
  quantities: { [key: string]: number };
  onQuantityChange: (orderId: string, newQuantity: number) => void;
  orderData: {
    address: string;
    phone_number: string;
    additional_notes: string;
  };
  onOrderDataChange: (field: string, value: string) => void;
  outlet: string;
  products: Order[];
  onProceedToPayment: () => void;
  isUpdating: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orders,
  quantities,
  onQuantityChange,
  orderData,
  onOrderDataChange,
  outlet,
  products,
  onProceedToPayment,
  isUpdating,
}) => {

  const handleProceed = () => {
    if (!orderData.address.trim()) {
      Alert.alert('Required Field', 'Please enter a delivery address before proceeding.');
      return;
    }
    if (!orderData.phone_number.trim()) {
      Alert.alert('Required Field', 'Please enter your phone number before proceeding.');
      return;
    }
    if (isUpdating) {
      Alert.alert('Please Wait', 'Please wait for quantity updates to complete.');
      return;
    }
    onProceedToPayment();
  };

  // Handle quantity change for individual orders
  const handleQuantityChange = (order: Order, increment: boolean) => {
    if (isUpdating) return;
    
    const currentQty = quantities[order.id] || 1;
    const newQuantity = increment ? currentQty + 1 : Math.max(currentQty - 1, 1);
    
    if (newQuantity !== currentQty) {
      onQuantityChange(order.id, newQuantity);
    }
  };

  // Calculate subtotal for all orders
  const subtotal = orders.reduce((sum, order) => {
    const price = order?.price || 0;
    const qty = quantities[order.id] || 1;
    return sum + price * qty;
  }, 0);

  const deliveryFee = 0; // add logic if needed
  const total = subtotal + deliveryFee;

  // Calculate total items
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0) || orders.length;

  // Validation helpers
  const isAddressValid = orderData.address.trim().length > 0;
  const isPhoneValid = orderData.phone_number.trim().length > 0;
  const canProceed = isAddressValid && isPhoneValid && !isUpdating;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Orders/Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Orders ({orders.length} {orders.length === 1 ? 'item' : 'items'})
          </Text>
          {orders.map((order, index) => {
            const price = order?.price || 0;
            const qty = quantities[order.id] || 1;
            const itemTotal = price * qty;

            return (
              <View key={order.id || index} style={[styles.productCard, index > 0 && styles.productCardBorder]}>
                <Text style={styles.productName}>
                  {order?.name || order?.product?.name || 'Product'}
                </Text>
                {(order?.description || order?.product?.description) && (
                  <Text style={styles.productDescription}>
                    {order?.description || order?.product?.description}
                  </Text>
                )}

                {/* Price Info */}
                <View style={styles.priceInfoContainer}>
                  <Text style={styles.unitPrice}>₦{Number(price).toFixed(2)} each</Text>
                  <Text style={styles.itemTotal}>Total: ₦{itemTotal.toFixed(2)}</Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton, 
                        (qty <= 1 || isUpdating) && styles.quantityButtonDisabled
                      ]}
                      onPress={() => handleQuantityChange(order, false)}
                      disabled={qty <= 1 || isUpdating}
                      activeOpacity={0.7}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#a0aec0" />
                      ) : (
                        <MaterialCommunityIcons 
                          name="minus" 
                          size={20} 
                          color={qty <= 1 ? '#a0aec0' : '#2d3748'} 
                        />
                      )}
                    </TouchableOpacity>

                    <View style={styles.quantityDisplay}>
                      <Text style={styles.quantityText}>{qty}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        isUpdating && styles.quantityButtonDisabled
                      ]}
                      onPress={() => handleQuantityChange(order, true)}
                      disabled={isUpdating}
                      activeOpacity={0.7}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#a0aec0" />
                      ) : (
                        <MaterialCommunityIcons 
                          name="plus" 
                          size={20} 
                          color="#2d3748" 
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Customer Information Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer Information
          </Text>
          
          {/* Delivery Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Delivery Address <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.inputContainer, 
              !isAddressValid && orderData.address.length > 0 && styles.inputContainerError
            ]}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your complete delivery address"
                placeholderTextColor="#a0aec0"
                value={orderData.address}
                onChangeText={(value) => onOrderDataChange('address', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            {!isAddressValid && orderData.address.length > 0 && (
              <Text style={styles.errorText}>Please provide a complete delivery address</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.inputContainer, 
              !isPhoneValid && orderData.phone_number.length > 0 && styles.inputContainerError
            ]}>
              <MaterialCommunityIcons name="phone" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.singleLineInput]}
                placeholder="Enter your phone number"
                placeholderTextColor="#a0aec0"
                value={orderData.phone_number}
                onChangeText={(value) => onOrderDataChange('phone_number', value)}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
            {!isPhoneValid && orderData.phone_number.length > 0 && (
              <Text style={styles.errorText}>Please provide a valid phone number</Text>
            )}
          </View>

          {/* Additional Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Additional Notes <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="note-text" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Any special instructions or notes for your order"
                placeholderTextColor="#a0aec0"
                value={orderData.additional_notes}
                onChangeText={(value) => onOrderDataChange('additional_notes', value)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Outlet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outlet</Text>
          <View style={styles.outletContainer}>
            <MaterialCommunityIcons name="store" size={20} color="#4a5568" />
            <Text style={styles.outletText}>{outlet || 'No outlet selected'}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            {/* Individual order breakdown */}
            {orders.length > 1 && (
              <>
                {orders.map((order) => {
                  const price = order?.price || 0;
                  const qty = quantities[order.id] || 1;
                  const itemTotal = price * qty;
                  
                  return (
                    <View key={order.id} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel} numberOfLines={1}>
                        {order?.name || order?.product?.name || 'Product'} (×{qty})
                      </Text>
                      <Text style={styles.summaryValue}>₦{itemTotal.toFixed(2)}</Text>
                    </View>
                  );
                })}
                <View style={styles.summaryDivider} />
              </>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </Text>
              <Text style={styles.summaryValue}>₦{subtotal.toFixed(2)}</Text>
            </View>
            
            {deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₦{deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Form Validation Status */}
        {(!isAddressValid || !isPhoneValid) && (
          <View style={styles.validationContainer}>
            <MaterialCommunityIcons name="information" size={16} color="#e53e3e" />
            <Text style={styles.validationText}>
              Please complete all required fields to proceed
            </Text>
          </View>
        )}

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton, 
            !canProceed && styles.proceedButtonDisabled
          ]}
          onPress={handleProceed}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          {isUpdating ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={styles.proceedButtonIcon} />
              <Text style={styles.proceedButtonText}>Updating...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons 
                name="credit-card" 
                size={20} 
                color="#fff" 
                style={styles.proceedButtonIcon}
              />
              <Text style={styles.proceedButtonText}>
                Proceed to Payment (₦{total.toFixed(2)})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  required: {
    color: '#e53e3e',
    fontSize: 14,
  },
  optional: {
    color: '#718096',
    fontSize: 14,
    fontStyle: 'italic',
  },
  productCard: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  productCardBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  priceInfoContainer: {
    marginBottom: 16,
  },
  unitPrice: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a5568',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quantityButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f7fafc',
    borderColor: '#e2e8f0',
    opacity: 0.6,
  },
  quantityDisplay: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 50,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: '#fc8181',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 24,
  },
  singleLineInput: {
    textAlignVertical: 'center',
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#e53e3e',
    marginTop: 6,
    marginLeft: 4,
  },
  outletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  outletText: {
    fontSize: 16,
    color: '#2d3748',
    marginLeft: 12,
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#718096',
    flex: 1,
    marginRight: 16,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    marginTop: 12,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  validationText: {
    fontSize: 14,
    color: '#e53e3e',
    marginLeft: 8,
    flex: 1,
  },
  proceedButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginTop: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: '#a0aec0',
    elevation: 1,
    shadowOpacity: 0.1,
    shadowColor: '#000',
  },
  proceedButtonIcon: {
    marginRight: 8,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OrderSummary;