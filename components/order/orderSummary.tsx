import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Product } from '../types/types';
import { useCreateOrder } from '@/mutation/useOrders';
import { Image } from 'expo-image';

type Props = {
  product: Product;
  setAddress: (address: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  address: string;
  outlet: string;
};

export default function OrderSummary({
  product,
  setAddress,
  quantity,
  setQuantity,
  address,
  outlet,
}: Props) {
  const { mutate: createOrder, isPending } = useCreateOrder(outlet);
  const [notes, setNotes] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');

  const increment = () => setQuantity(quantity + 1);
  const decrement = () => quantity > 1 && setQuantity(quantity - 1);

  const handleSubmit = () => {
    if (!address || !phoneNumbers) {
      alert('Please fill out all required fields');
      return;
    }

    createOrder(
      {
        product_id: product.id,
        quantity,
        outlet,
        address,
        phone_number: phoneNumbers,
        additional_notes: notes || undefined,
      },
      {
        onSuccess: () => alert('✅ Order created successfully!'),
        onError: () => alert('❌ Failed to create order. Please try again.'),
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Info */}
        <View style={styles.checkoutSection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <Image
            source={{ uri: product?.main_image_url ?? '' }}
            style={styles.orderItemImage}
          />
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.itemPrice}>₦ {product.price}</Text>

          <View style={styles.quantityRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={decrement}
                style={[styles.quantityBtn, quantity === 1 && styles.disabledBtn]}
                disabled={quantity === 1}
              >
                <Entypo name="minus" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={increment} style={styles.quantityBtn}>
                <Entypo name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.checkoutSection}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Delivery Address *</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your complete delivery address"
              style={styles.textArea}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Active Phone Numbers *</Text>
            <TextInput
              multiline
              numberOfLines={2}
              value={phoneNumbers}
              onChangeText={setPhoneNumbers}
              placeholder="Enter phone numbers"
              keyboardType="phone-pad"
              style={styles.textArea}
              textAlignVertical="top"
            />
            <Text style={styles.phoneNote}>
              You may receive a call to discuss delivery fees if needed.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions"
              style={styles.textArea}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, isPending && { opacity: 0.6 }]}
          onPress={handleSubmit}
        
        >
          <Text style={styles.nextButtonText}>
            {isPending ? 'Placing Order...' : 'Continue to Payment'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    flexGrow: 1,
    paddingBottom: 100,
  },
   orderItemImage: {
    width:'100%',
    height: 120,
    borderRadius: 6,
    marginRight: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  checkoutSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    paddingBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e53e3e',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontWeight: '500',
    color: '#4a5568',
  },
  quantityValue: {
    fontWeight: '700',
    color: '#2d3748',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBtn: {
    backgroundColor: '#2d3748',
    width: 34,
    height: 34,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#888',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#fff',
    borderColor: '#e1e4e8',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: 'black',
  },
  phoneNote: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#718096',
    fontSize: 12,
  },
  nextButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});
