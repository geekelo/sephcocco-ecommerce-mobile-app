// PaymentMethod.tsx
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
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import PaymentModal from "../modal/payment";
import { SuccessModal } from "../modal/sucess";
import { router } from "expo-router";
import { usePayment, useVerifyPayment, usePaystackPayment } from "@/mutation/usePayment";
import { getUser } from "@/lib/tokenStorage";
import { useOutlet } from "@/context/outletContext";

type PaymentMethodProps = {
  address: string;
  products: { price: number; name?: string, id:string }[];
  quantity: number;
  orderIds: string[];
};

type PaymentStep = 'select' | 'processing' | 'complete';

export default function PaymentMethod({
  address,
  products,
  quantity,
  orderIds = products.map((p) => p.id),
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "online" | null>(null);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const { activeOutlet } = useOutlet();
  const { mutate: submitPayment, isPending: isSubmitting } = usePayment();
  const { mutate: verifyPayment, data: verifydata } = useVerifyPayment();
  const {
    mutate: initPaystackPayment,
    isPending: isInitializing,
    data,
    isError,
    error,
  } = usePaystackPayment();

  const derivedOrderIds = orderIds.length ? orderIds : products.map((p) => p.id);
  const itemTotal = products.reduce((sum, p) => sum + (p?.price || 0) * quantity, 0);
  const totalCost = itemTotal;

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePaymentMethodSelect = (method: "bank" | "online") => {
    setPaymentMethod(method);
    
    // Animate selection feedback
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBankPaymentConfirm = () => {
    setCurrentStep('processing');

    if (!activeOutlet || !derivedOrderIds) {
      Alert.alert("Error", "Missing outlet or order information.");
      setCurrentStep('select');
      return;
    }

    submitPayment(
      {
        outlet: activeOutlet,
        orderIds: derivedOrderIds,
        amount: totalCost,
        paymentMethod: "bank_transfer",
        transactionId: user?.payment_ref,
      },
      {
        onSuccess: (res) => {
          setCurrentStep('complete');
          setShowModal(false);
          setTimeout(() => setShowSuccessModal(true), 500);
        },
        onError: (err) => {
          console.error("❌ Bank Payment Failed:", err);
          setCurrentStep('select');
          Alert.alert(
            "Payment Failed", 
            "We couldn't process your payment. Please check your details and try again.",
            [{ text: "OK", style: "default" }]
          );
        },
      }
    );
  };

  const initializePaystackPayment = () => {
    setCurrentStep('processing');

    if (!activeOutlet) {
      Alert.alert("Error", "Missing outlet or order information.");
      setCurrentStep('select');
      return;
    }

    if (!user?.email) {
      Alert.alert("Email Required", "We need your email address to process the payment securely.");
      setCurrentStep('select');
      return;
    }

    initPaystackPayment(
      {
        outlet: activeOutlet,
        orderIds: derivedOrderIds,
        amount: totalCost,
        paymentMethod: "online",
        transactionId: user?.payment_ref,
      },
      {
        onSuccess: (res: any) => {
          const authUrl = res?.data?.data?.authorization_url;
          const reference = res?.data?.data?.reference;

          if (authUrl && reference) {
            setPaymentUrl(authUrl);
            setPaymentRef(reference);
            setShowPaystackModal(true);
          } else {
            console.error("⚠️ Missing Paystack data", res);
            setCurrentStep('select');
            Alert.alert("Error", "Unable to initialize payment. Please try again.");
          }
        },
        onError: (err) => {
          console.error("❌ Paystack Init Failed:", err);
          setCurrentStep('select');
          Alert.alert("Connection Error", "Unable to connect to payment service. Please check your internet connection and try again.");
        },
      }
    );
  };

  const handleCheckoutPress = () => {
    if (!paymentMethod) {
      Alert.alert(
        "Select Payment Method", 
        "Please choose how you'd like to pay before proceeding.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        "Delivery Address Required", 
        "Please provide a delivery address to complete your order.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (paymentMethod === "bank") {
      setShowModal(true);
    } else if (paymentMethod === "online") {
      initializePaystackPayment();
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;

    if (
      url.includes("paystack.com/close") ||
      url.includes("success") ||
      url.includes("your-callback-url.com/callback")
    ) {
      setShowPaystackModal(false);
      setCurrentStep('processing');

      if (!paymentRef) {
        console.error("⚠️ No reference stored for verification");
        setCurrentStep('select');
        return;
      }

      verifyPayment(
        {
          outlet: activeOutlet!,
          reference: paymentRef,
        },
        {
          onSuccess: (res) => {
            setCurrentStep('complete');
            setTimeout(() => setShowSuccessModal(true), 500);
          },
          onError: (err) => {
            console.error("❌ Payment Verification Failed:", err);
            setCurrentStep('select');
            Alert.alert(
              "Verification Error",
              "We're having trouble confirming your payment. Please contact our support team for assistance."
            );
          },
        }
      );
    }

    if (url.includes("cancel")) {
      setShowPaystackModal(false);
      setCurrentStep('select');
      Alert.alert("Payment Cancelled", "You can try again when you're ready.");
    }
  };

  const paymentDetails = [
    { label: "Account Number:", value: "1234567890" },
    { label: "Bank Name:", value: "SmartSphere Inc." },
    { label: "Reference Code:", value: user?.payment_ref ?? "Loading..." },
  ];

  const canProceedWithCheckout = paymentMethod && address.trim().length > 0;
  const isProcessing = currentStep === 'processing' || isSubmitting || isInitializing;

  const renderProgressSteps = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[
          styles.progressStep,
          styles.progressStepActive
        ]}>
          <MaterialCommunityIcons name="credit-card-outline" size={16} color="#fff" />
        </View>
        <View style={[
          styles.progressLine,
          currentStep !== 'select' && styles.progressLineActive
        ]} />
        <View style={[
          styles.progressStep,
          currentStep === 'processing' || currentStep === 'complete' ? styles.progressStepActive : styles.progressStepInactive
        ]}>
          {currentStep === 'processing' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons 
              name={currentStep === 'complete' ? "check" : "clock-outline"} 
              size={16} 
              color={currentStep === 'complete' ? "#fff" : "#a0aec0"} 
            />
          )}
        </View>
        <View style={[
          styles.progressLine,
          currentStep === 'complete' && styles.progressLineActive
        ]} />
        <View style={[
          styles.progressStep,
          currentStep === 'complete' ? styles.progressStepActive : styles.progressStepInactive
        ]}>
          <MaterialCommunityIcons 
            name="check-all" 
            size={16} 
            color={currentStep === 'complete' ? "#fff" : "#a0aec0"} 
          />
        </View>
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Payment</Text>
        <Text style={styles.progressLabel}>Processing</Text>
        <Text style={styles.progressLabel}>Complete</Text>
      </View>
    </View>
  );

  const renderPaymentOption = (
    method: "bank" | "online",
    icon: string,
    title: string,
    subtitle: string
  ) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        paymentMethod === method && styles.paymentOptionSelected
      ]}
      onPress={() => handlePaymentMethodSelect(method)}
      activeOpacity={0.7}
      disabled={isProcessing}
    >
      <View style={styles.paymentOptionHeader}>
        <View style={styles.paymentOptionIcon}>
          <MaterialCommunityIcons 
            name={icon as any} 
            size={24} 
            color={paymentMethod === method ? "#3182ce" : "#4a5568"} 
          />
        </View>
        <View style={styles.paymentOptionContent}>
          <Text style={[
            styles.paymentOptionTitle,
            paymentMethod === method && styles.paymentOptionTitleSelected
          ]}>
            {title}
          </Text>
          <Text style={styles.paymentOptionSubtitle}>{subtitle}</Text>
        </View>
        {paymentMethod === method && (
          <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[
      { flex: 1 },
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        {renderProgressSteps()}

        {/* Payment Method Selection */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred way to pay for this order
          </Text>
          
          <View style={styles.paymentOptions}>
            {renderPaymentOption(
              "bank",
              "bank-transfer",
              "Bank Transfer",
              "Transfer directly from your bank account"
            )}
            {renderPaymentOption(
              "online",
              "credit-card",
              "Pay with Card",
              "Secure online payment with debit/credit card"
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummaryContent}>
            {products.map((p, idx) => (
              <View key={idx} style={styles.orderItem}>
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName}>
                    {p.name ?? `Item ${idx + 1}`}
                  </Text>
                  <Text style={styles.orderItemQuantity}>Qty: {quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  ₦{((p?.price || 0) * quantity).toLocaleString()}
                </Text>
              </View>
            ))}
            
            <View style={styles.orderTotalRow}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₦{totalCost.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliverySection}>
          <View style={styles.deliveryHeader}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#4a5568" />
            <Text style={styles.deliveryTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.deliveryAddress}>{address || "No address provided"}</Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !canProceedWithCheckout && styles.checkoutButtonDisabled,
            isProcessing && styles.checkoutButtonProcessing
          ]}
          disabled={!canProceedWithCheckout || isProcessing}
          onPress={handleCheckoutPress}
          activeOpacity={0.8}
        >
          <View style={styles.checkoutButtonContent}>
            {isProcessing ? (
              <>
                <ActivityIndicator color="#fff" size="small" style={styles.buttonLoader} />
                <Text style={styles.checkoutButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Text style={styles.checkoutButtonText}>
                  {!paymentMethod
                    ? "Select Payment Method"
                    : `Pay ₦${totalCost.toLocaleString()}`}
                </Text>
                {paymentMethod && (
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bank Transfer Modal */}
      <PaymentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Complete Bank Transfer"
        details={paymentDetails}
        onConfirm={handleBankPaymentConfirm}
        isLoading={isSubmitting}
      />

      {/* Paystack WebView */}
      <Modal 
        visible={showPaystackModal} 
        animationType="slide" 
        onRequestClose={() => setShowPaystackModal(false)}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              onPress={() => setShowPaystackModal(false)} 
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Secure Payment</Text>
            <View style={styles.securityIndicator}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#10b981" />
            </View>
          </View>

          {paymentUrl ? (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#3182ce" />
                  <Text style={styles.loadingText}>Loading secure payment...</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#3182ce" />
              <Text style={styles.loadingText}>Initializing payment...</Text>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  
  // Progress Steps
  progressContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: '#3182ce',
  },
  progressStepInactive: {
    backgroundColor: '#e2e8f0',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3182ce',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
    textAlign: 'center',
  },

  // Payment Section
  paymentSection: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1a202c',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
  },
  paymentOptionSelected: {
    borderColor: '#3182ce',
    backgroundColor: '#f0f9ff',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  paymentOptionTitleSelected: {
    color: '#3182ce',
  },
  paymentOptionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  // Order Summary
  orderSummarySection: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderSummaryContent: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 2,
  },
  orderItemQuantity: {
    fontSize: 13,
    color: '#64748b',
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3748',
  },
  orderTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    marginTop: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },

  // Delivery Section
  deliverySection: {
    backgroundColor: 'white',
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },

  // Checkout Button
  checkoutButton: {
    backgroundColor: '#3182ce',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    minHeight: 56,
    elevation: 3,
    shadowColor: '#3182ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#a0aec0',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonProcessing: {
    backgroundColor: '#2d3748',
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonLoader: {
    marginRight: 8,
  },

  // WebView Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
});