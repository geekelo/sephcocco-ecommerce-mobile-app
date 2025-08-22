import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';
import PaymentModal from "../modal/payment";
import { SuccessModal } from "../modal/sucess";
import { router } from "expo-router";
import { usePayment, useVerifyPayment } from "@/mutation/usePayment";
import { getUser } from "@/lib/tokenStorage";
import { useOutlet } from "@/context/outletContext";

type PaymentMethodProps = {
  address: string;
  products: { price: number; name?: string }[];
  quantity: number;
  orderIds: string[];
};

export default function PaymentMethod({
  address,
  products,
  quantity,
  orderIds = [],
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "online" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>("");

  const { activeOutlet } = useOutlet();
  const { mutate: submitPayment, isPending: isSubmitting } = usePayment();
  const { mutate: verifyPayment } = useVerifyPayment();

  const itemTotal = products.reduce((sum, p) => sum + (p?.price || 0) * quantity, 0);
  const totalCost = itemTotal;

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleBankTransfer = () => setPaymentMethod("bank");
  const handleOnlinePayment = () => setPaymentMethod("online");

  const handleBankPaymentConfirm = () => {
    if (!activeOutlet || !orderIds.length) {
      Alert.alert("Error", "Missing outlet or order information.");
      return;
    }

    submitPayment(
      {
        outlet: activeOutlet,
        orderIds,
        amount: totalCost,
        paymentMethod: "bank_transfer",
        transactionId: user?.payment_ref,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setTimeout(() => setShowSuccessModal(true), 300);
        },
        onError: () => {
          Alert.alert("Payment Failed", "Please try again or contact support.");
        },
      }
    );
  };

  // Initialize Paystack payment
  const initializePaystackPayment = async () => {
    try {
      // Generate a unique reference
      const reference = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk_live_3aec19cabd9dd45b64cca73e48bc5d4733b5ff4b`, // Your secret key (replace with actual)
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          amount: totalCost * 100, // Amount in kobo
          currency: 'NGN',
          reference: reference,
          callback_url: 'https://standard.paystack.co/close', // Standard Paystack callback
          metadata: {
            custom_fields: [
              {
                display_name: "Order IDs",
                variable_name: "order_ids",
                value: orderIds.join(',')
              }
            ]
          }
        }),
      });

      const data = await response.json();
      console.log('Paystack response:', data); // For debugging
      
      if (data.status && data.data?.authorization_url) {
        setPaymentUrl(data.data.authorization_url);
        setShowPaystackModal(true);
      } else {
        Alert.alert("Error", `Failed to initialize payment: ${data.message || 'Unknown error'}`);
        console.error('Paystack error:', data);
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.");
      console.error("Payment initialization error:", error);
    }
  };

  const handleCheckoutPress = () => {
    if (!paymentMethod) {
      Alert.alert("Payment Method Required", "Please select a payment method to proceed.");
      return;
    }

    if (paymentMethod === "bank") {
      setShowModal(true);
    } else if (paymentMethod === "online") {
      if (!user?.email) {
        Alert.alert("Email Required", "User email is required for online payment.");
        return;
      }
      initializePaystackPayment();
    }
  };

  // Handle WebView navigation state changes
  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('WebView URL:', url); // For debugging
    
    // Check if payment was completed (Paystack redirects to close page)
    if (url.includes('standard.paystack.co/close')) {
      // Extract reference from URL
      try {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const reference = urlParams.get('reference') || urlParams.get('trxref');
        
        setShowPaystackModal(false);
        
        if (reference) {
          // Show loading while verifying
          Alert.alert("Processing", "Verifying payment...");
          
          verifyPayment(
            { outlet: activeOutlet, reference: reference },
            {
              onSuccess: (data) => {
                if (data?.status === "success") {
                  setShowSuccessModal(true);
                } else {
                  Alert.alert("Payment Status", "Payment verification completed but status is unclear. Please contact support if money was deducted.");
                }
              },
              onError: () => {
                Alert.alert("Verification Error", "Could not verify payment. Please contact support if money was deducted.");
              },
            }
          );
        } else {
          Alert.alert("Payment Completed", "Payment window closed. If payment was successful, it will reflect shortly.");
        }
      } catch (error) {
        setShowPaystackModal(false);
        Alert.alert("Payment Completed", "Payment window closed. If payment was successful, it will reflect shortly.");
      }
    }
    
    // Handle explicit cancellation
    if (url.includes('cancelled') || url.includes('cancel')) {
      setShowPaystackModal(false);
      Alert.alert("Payment Cancelled", "You cancelled the payment process.");
    }
  };

  const paymentDetails = [
    { label: "Account Number:", value: "1234567890" },
    { label: "Bank Name:", value: "SmartSphere Inc." },
    { label: "Reference Code:", value: user?.payment_ref ?? "N/A" },
  ];

  const canProceedWithCheckout = paymentMethod && address.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Payment Options */}
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          {/* Bank */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "bank" && styles.paymentOptionSelected]}
            onPress={handleBankTransfer}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionInner}>
              <MaterialCommunityIcons name="bank" size={24} color="#4a5568" />
              <Text style={styles.paymentOptionLabel}>Bank Transfer</Text>
              {paymentMethod === "bank" && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#4299e1" />
              )}
            </View>
          </TouchableOpacity>

          {/* Online */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "online" && styles.paymentOptionSelected]}
            onPress={handleOnlinePayment}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionInner}>
              <MaterialCommunityIcons name="credit-card" size={24} color="#4a5568" />
              <Text style={styles.paymentOptionLabel}>Online Payment</Text>
              {paymentMethod === "online" && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#4299e1" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.orderTotalSection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {products.map((p, idx) => (
          <View key={idx} style={styles.orderTotalRow}>
            <Text style={styles.orderTotalLabel}>
              {p.name ?? `Item ${idx + 1}`} (x{quantity})
            </Text>
            <Text style={styles.orderTotalValue}>₦{((p?.price || 0) * quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.orderTotalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>₦{totalCost.toFixed(2)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[styles.checkoutButton, (!canProceedWithCheckout || isSubmitting) && styles.checkoutButtonDisabled]}
        disabled={!canProceedWithCheckout || isSubmitting}
        onPress={handleCheckoutPress}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.checkoutButtonText}>
            {!paymentMethod
              ? "Select Payment Method"
              : paymentMethod === "bank"
              ? "Proceed with Bank Transfer"
              : "Pay Online"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Bank Transfer Modal */}
      <PaymentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Make Payment"
        details={paymentDetails}
        onConfirm={handleBankPaymentConfirm}
        isLoading={isSubmitting}
      />

      {/* Paystack Payment WebView */}
      <Modal 
        visible={showPaystackModal} 
        animationType="slide"
        onRequestClose={() => setShowPaystackModal(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              onPress={() => setShowPaystackModal(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <View style={styles.placeholder} />
          </View>
          
          {paymentUrl ? (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3182ce" />
                  <Text>Loading payment...</Text>
                </View>
              )}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3182ce" />
              <Text>Initializing payment...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onButtonPress={() => {
          setShowSuccessModal(false);
          router.push("/pharmacy");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  paymentSection: { marginBottom: 20, backgroundColor: "white", padding: 24, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16, color: "#2d3748" },
  paymentOptions: { gap: 12 },
  paymentOption: { borderWidth: 2, borderColor: "#e2e8f0", borderRadius: 12, paddingVertical: 20, paddingHorizontal: 16, backgroundColor: "#fff" },
  paymentOptionSelected: { borderColor: "#4299e1", backgroundColor: "#ebf8ff" },
  paymentOptionInner: { flexDirection: "row", alignItems: "center" },
  paymentOptionLabel: { fontWeight: "500", fontSize: 16, color: "#2d3748", flex: 1, marginLeft: 16 },
  orderTotalSection: { marginBottom: 32, backgroundColor: "white", padding: 24, borderRadius: 12 },
  orderTotalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, paddingVertical: 4 },
  orderTotalLabel: { fontSize: 16, color: "#4a5568", flex: 1 },
  orderTotalValue: { fontSize: 16, fontWeight: "500", color: "#2d3748" },
  grandTotal: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 16, marginTop: 16 },
  grandTotalLabel: { fontSize: 20, fontWeight: "600", color: "#2d3748" },
  grandTotalValue: { fontSize: 20, fontWeight: "600", color: "#10b981" },
  checkoutButton: { backgroundColor: "#3182ce", borderRadius: 12, paddingVertical: 18, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", minHeight: 56 },
  checkoutButtonDisabled: { backgroundColor: "#a0aec0" },
  checkoutButtonText: { color: "white", fontWeight: "600", fontSize: 16, textAlign: "center" },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  placeholder: {
    width: 40, // Same as close button width for centering
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});