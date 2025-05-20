import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import ProductInfo from '@/components/products/productInfo';
import InfoSection from '@/components/order/infoSection';
import { useLocalSearchParams } from 'expo-router';
import { orders } from '@/components/order/ordersdata';
import { Layout } from '@/components/layout/Layout';
import { Colors } from '@/constants/Colors';

const OrderDetails = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
  const route = useRoute();
   const { orderId } = useLocalSearchParams();
  
  const order = orders.find(o => o.id.toString() === orderId) || orders[0];
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  return (
    <Layout>
    <View style={[styles.container, {backgroundColor:theme.text}]} >
      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={20} color={theme.text} />
          <Text style={[styles.backText, {color:theme.text}]}>Back</Text>
        </TouchableOpacity>
      </View>
      
      {/* Order Status Message */}
      <View style={styles.statusMessage}>
        <Text style={[styles.statusText, {color:theme.success}]}>
          Your order will be completed 2-3 hours after arrival. During this period, you can raise a dispute if 
          you did not receive your product or received the wrong product.
        </Text>
      </View>
      
      {/* Product Information */}
      <ProductInfo
        name={order.name}
        image={order.image}
        price={order.price}
       
        ratingCount={order.ratingCount}
        status={order.status}
        likes={order.likes}
        isFavorite={order.isFavorite}
      />
      
      {/* Product Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Product Description</Text>
        <Text style={styles.descriptionText}>
          {order.longDescription || 
           "Lorem ipsum dolor sit amet consectetur. Neque tincidunt urna rhoncus vitae sit. Sodales nec diam dignissim eu risus. Orci ac sed pellentesque venenatis nunc mi cursus viverra. Turpis laculis massa elementum eu. Ipsum imperdiet tincida arcu erat gravida."}
        </Text>
      </View>
      
      {/* Information Sections */}
      <View style={styles.infoSectionsContainer}>
        <InfoSection
          title="Payment Information"
          items={[
            { label: "Payment Method:", value: "Door step Delivery" },
            { label: "Payment Details:", value: "Lorem ipsum dolor sit amet consectetur. Rhoncus vel praesent duis et." }
          ]}
        />
        
        <InfoSection
          title="Delivery Information"
          items={[
            { label: "Delivery Method:", value: "Door step Delivery" },
            { label: "Shipping Address:", value: "Lorem ipsum dolor sit amet consectetur. Rhoncus vel praesent duis et." },
            { label: "Shipping Details:", value: "Lorem ipsum dolor sit amet consectetur. Rhoncus vel praesent duis et." }
          ]}
        />
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
          <Text style={[styles.helpButtonText, {color:theme.text}]}>Get Help</Text>
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
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16, 
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
});
