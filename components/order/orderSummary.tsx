import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/types';

interface OrderSummaryProps {
  products: [];
  quantity: number; // default quantity if individual product quantity not provided
  setQuantity: (quantity: number) => void;
  address: string;
  setAddress: (address: string) => void;
  outlet: string;
  onProceedToPayment?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  products,
  quantity,
  setQuantity,
  address,
  setAddress,
  outlet,
  onProceedToPayment,
}) => {

  const handleProceed = () => {
    if (!address.trim()) {
      Alert.alert('Required Field', 'Please enter a delivery address before proceeding.');
      return;
    }
    onProceedToPayment?.();
  };

  // Calculate subtotal for all products
  const subtotal = products.reduce((sum, product) => {
    const price = (product as any)?.price || 0;
    const qty = (product as any)?.quantity || quantity;
    return sum + price * qty;
  }, 0);

  const deliveryFee = 0; // add logic if needed
  const total = subtotal + deliveryFee;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Products */}
        {/* Products */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Products</Text>
  {products.map((product, index) => {
    const price = (product as any)?.price || 0;
    const qty = (product as any)?.quantity || quantity;

    return (
      <View key={index} style={styles.productCard}>
        <Text style={styles.productName}>
          {(product as any)?.name || 'Product'}
        </Text>
        <Text style={styles.productDescription}>
          {(product as any)?.description || ''}
        </Text>

        {/* Price + Quantity Controls */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.productPrice}> ₦ {Number(price ?? 0).toFixed(2)} x {qty}</Text>

          {/* Quantity Buttons */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, qty <= 1 && styles.quantityButtonDisabled]}
              onPress={() => qty > 1 && setQuantity(qty - 1)}
              disabled={qty <= 1}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2d3748' }}>-</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{qty}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(qty + 1)}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2d3748' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  })}
</View>


        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Delivery Address <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your delivery address"
              placeholderTextColor="#a0aec0"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          {address.trim().length === 0 && (
            <Text style={styles.helperText}>Please provide a complete delivery address</Text>
          )}
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
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
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

        {/* Proceed */}
        <TouchableOpacity
          style={[styles.proceedButton, !address.trim() && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={!address.trim()}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
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
    paddingBottom: 120, // Extra space for keyboard and button
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
    marginBottom: 12,
  },
  required: {
    color: '#e53e3e',
  },
  productCard: {
    padding: 0,
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
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f7fafc',
    borderColor: '#e2e8f0',
  },
  quantityDisplay: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 60,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
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
    minHeight: 100,
    maxHeight: 150,
  },
  inputIcon: {
    marginTop: 4,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    textAlignVertical: 'top',
    minHeight: 80,
    maxHeight: 120,
    paddingTop: 4,
    paddingBottom: 8,
    lineHeight: 22,
  },
  helperText: {
    fontSize: 12,
    color: '#e53e3e',
    marginTop: 4,
  },
  outletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
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
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#718096',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: '#a0aec0',
    elevation: 1,
    shadowOpacity: 0.1,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});

export default OrderSummary