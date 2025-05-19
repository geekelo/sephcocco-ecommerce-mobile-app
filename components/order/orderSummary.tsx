import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Product } from '../types/types';


type OrderSummaryProps = {
  product: Product;
  setAddress: (address: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  address: string;
 
};

export default function OrderSummary({
  product,
  setAddress,
  quantity,
  setQuantity,
  address,
 
}: OrderSummaryProps) {
  const [notes, setNotes] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string>('');


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.orderItem}>
          <Image source={ product.image } style={styles.orderItemImage} />

          <View style={styles.orderItemDetails}>
            <Text style={styles.productName}>{product.title}</Text>

            <View>
              <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
              <Text style={styles.quantityLabel}>
                 Quantity: <Text style={styles.quantityValue}>{quantity}</Text>
              </Text>
            </View>

           
          </View>
        </View>
      </View>

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
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Active Phone Numbers *</Text>
          <TextInput
            multiline
            numberOfLines={2}
            value={phoneNumbers}
            onChangeText={setPhoneNumbers}
            placeholder="Enter phone numbers separated by commas"
            style={styles.textArea}
          />
          <Text style={styles.phoneNote}>You may receive a call to discuss delivery fees if needed.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Notes (Optional)</Text>
          <TextInput
            multiline
            numberOfLines={2}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for delivery"
            style={styles.textArea}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.nextButtonMobile}>
        <Text style={styles.nextButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    backgroundColor: '#f8f9fa',
   
  },
  checkoutSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
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
  orderItem: {
    flexDirection: 'column',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    paddingBottom: 16,
  },
  orderItemImage: {
    width:'100%',
    height: 200,
    borderRadius: 6,
    marginRight: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  orderItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e53e3e',
  },
  quantityLabel: {
    fontWeight: '500',
    color: '#4a5568',
    paddingVertical:12
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
    textAlignVertical: 'top',
  },
  phoneNote: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#718096',
    fontSize: 12,
  },
  nextButtonMobile: {
    backgroundColor: '#3182ce',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});
