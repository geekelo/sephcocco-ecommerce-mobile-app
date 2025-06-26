import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Layout } from '@/components/layout/Layout';
import ProductInfo from '@/components/products/productInfo';
import InfoSection from '@/components/order/infoSection';
import { Colors } from '@/constants/Colors';
import { getUser } from '@/lib/tokenStorage';
import { useOutlet } from '@/context/outletContext';
import { useGetOrderById } from '@/mutation/useOrders';

const OrderDetails = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const { activeOutlet } = useOutlet();
const { id } = useLocalSearchParams();
const orderId = typeof id === 'string' ? id : undefined;
console.log('orderId:', orderId);

  const [userId, setUserId] = useState<string | null>(null);
console.log('orderid',orderId)
  useEffect(() => {
    getUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  const {
  data: order,
  isLoading,
  isError,
} = useGetOrderById(
  activeOutlet ?? '',
  orderId ?? '',
  userId
);

  console.log(order)

  const handleBack = () => navigation.goBack();

  if (!activeOutlet || !orderId || !userId) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Text>Loading data...</Text>
        </View>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Text>Fetching order details...</Text>
        </View>
      </Layout>
    );
  }

  if (isError || !order) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Text>Failed to load order.</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color={theme.text} />
            <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Order Status Message */}
        <View style={styles.statusMessage}>
          <Text style={[styles.statusText, { color: theme.success }]}>
            Your order will be completed 2-3 hours after arrival. During this period,
            you can raise a dispute if you did not receive your product or received the wrong product.
          </Text>
        </View>

        {/* Product Info */}
        <ProductInfo
          name={order.product?.name ?? 'Unnamed Product'}
          image={
            order.product?.main_image_url
              ? { uri: order.product.main_image_url }
              : require('@/assets/images/logo.png')
          }
          price={parseFloat(order.unit_price)}
          ratingCount={order.ratingCount ?? 0}
          status={order.status}
          likes={order.likes ?? 0}
          isFavorite={order.isFavorite ?? false}
        />

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.descriptionText}>
            {order.product?.description ??
              'No description available for this product.'}
          </Text>
        </View>

        {/* Info Sections */}
        <View style={styles.infoSectionsContainer}>
          <InfoSection
            title="Payment Information"
            items={[
              { label: 'Payment Method:', value: 'Door step Delivery' },
              {
                label: 'Payment Details:',
                value: 'Paid at point of delivery',
              },
            ]}
          />

          <InfoSection
            title="Delivery Information"
            items={[
              { label: 'Delivery Method:', value: 'Door step Delivery' },
              {
                label: 'Shipping Address:',
                value: order.delivery_address ?? 'Not provided',
              },
              {
                label: 'Shipping Details:',
                value: 'Delivery estimated within 24 hours',
              },
            ]}
          />
        </View>

        {/* Help Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
            <Text style={[styles.helpButtonText, { color: theme.text }]}>
              Get Help
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

export default OrderDetails;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nav: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  statusMessage: {
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statusText: {
    fontSize: 14,
    lineHeight: 21,
  },
  descriptionSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  infoSectionsContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  actionButtons: {
    marginTop: 32,
  },
  helpButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  helpButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
