import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Product } from '../types/types';
import { useCreateOrder } from '@/mutation/useOrders';

type OrderSummaryProps = {
  product: Product;
  setAddress: (address: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  address: string;
  outlet: string; // ✅ Added outlet prop
};


export default function OrderSummary({
  product,
  setAddress,
  quantity,
  setQuantity,
  address,
  outlet
}: OrderSummaryProps) {
  const { mutate: createOrder, isPending } = useCreateOrder(outlet);

  const [notes, setNotes] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string>('');
const incrementQuantity = () => setQuantity(quantity + 1);

const decrementQuantity = () => {
  if (quantity > 1) setQuantity(quantity - 1);
};


const handleCreateOrder = () => {
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
      onSuccess: () => {
        alert("✅ Order created successfully!");
      },
      onError: (error: any) => {
        console.error("Order creation failed:", error);
        alert("❌ Failed to create order. Please try again.");
      },
    }
  );
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.orderItem}>
          <Image
            source={{ uri: product?.main_image_url ?? '' }}
            style={styles.orderItemImage}
          />

          <View style={styles.orderItemDetails}>
            <Text style={styles.productName}>{product?.name}</Text>
            <Text style={styles.itemPrice}>₦ {product?.price}</Text>

            <View style={styles.quantityRow}>
              <View style={{display:'flex', flexDirection:'row', gap:4}}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <Text style={styles.quantityValue}>{quantity}</Text>
              </View>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  onPress={decrementQuantity}
                  style={[
                    styles.quantityBtn,
                    quantity === 1 && styles.disabledBtn,
                  ]}
                  disabled={quantity === 1}
                >
                  <Entypo name="minus" size={18} color="#fff" />
                </TouchableOpacity>

                

                <TouchableOpacity
                  onPress={incrementQuantity}
                  style={styles.quantityBtn}
                >
                  <Entypo name="plus" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
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
            placeholder="Any special instructions for delivery"
            style={styles.textArea}
          />
        </View>
      </View>

    <TouchableOpacity
  style={[styles.nextButtonMobile, isPending && { opacity: 0.6 }]}
  onPress={handleCreateOrder}
  disabled={isPending}
>
  <Text style={styles.nextButtonText}>
    {isPending ? 'Placing Order...' : 'Continue to Payment'}
  </Text>
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
    marginVertical: 8,
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
    paddingVertical:4
  },
  quantityValue: {
    fontWeight: '700',
    color: '#2d3748',
     paddingVertical:4
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
    backgroundColor: '#333',
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
  quantityControl: {
  marginTop: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
quantityRow: {
  marginTop: 12,
  flexDirection: 'column',

 gap:6
},
btnSelector: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
quBtn: {
  backgroundColor: '#2d3748',
  width: 36,
  height: 36,
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
},
quadisabledBtn: {
  backgroundColor: '#a0aec0',
},

  
});
