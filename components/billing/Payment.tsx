import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import PaymentModal from "../modal/payment";
import { SuccessModal } from "../modal/sucess";
import { router } from "expo-router";
import PaystackWebView from "react-native-paystack-webview";

// ✅ import your mutation hook
import { useVerifyPayment } from "@/mutation/usePayment";

 const MakePaymentScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const navigation = useNavigation();

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);

  // ✅ use verifyPayment mutation
  const { mutate: verifyPayment, isPending: isLoading } = useVerifyPayment();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const orderDetails = {
    "Order ID": "#A123B",
    Item: "Modern Sofa",
    Date: "May 15, 2025",
    "Total Amount": "$230.00",
  };

  const paymentDetails = [
    { label: "Account Number:", value: "1234567890" },
    { label: "Bank Name:", value: "SmartSphere Inc." },
    { label: "Reference Code:", value: "#REF1234" },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.light.orange} />
        </TouchableOpacity>
        <ThemedText fontFamily="Raleway-Regular" style={[styles.backText, { color: Colors.light.orange }]}>
          Go Back
        </ThemedText>
        <View />
      </View>

      {/* Order Card */}
      <ThemedView style={{ backgroundColor: Colors.light.pink, padding: 24, marginVertical: 30, margin: 20 }}>
        <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
          Make Payment
        </ThemedText>
        <ThemedText fontFamily="Raleway-Regular" style={[styles.subtitle, { color: theme.text }]}>
          Thank you for your order. Please select a payment method below. You will be redirected to Paystack.
        </ThemedText>

        {/* Order Details Grid */}
        <View style={styles.grid}>
          {Object.entries(orderDetails).map(([label, value]) => (
            <View style={styles.gridRow} key={label}>
              <ThemedText fontFamily="Raleway-Regular" style={[styles.gridLabel, { color: "#000" }]}>
                {label}
              </ThemedText>
              <ThemedText fontFamily="Raleway-Regular" style={[styles.gridValue, { color: theme.gray }]}>
                {value}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Make Payment"
        details={paymentDetails}
        buttonText="Pay with Paystack"
        isLoading={isLoading}
        onConfirm={() => {
          setShowModal(false);
          setShowPaystack(true); // 🔹 open Paystack
        }}
      />

      {/* Paystack WebView */}
      {showPaystack && (
        <PaystackWebView
          paystackKey="pk_test_xxxxxxxxxxxxxxx" // replace with your public key
          amount={23000} // kobo (₦230.00)
          billingEmail="customer@email.com"
          billingMobile="08012345678"
          billingName="John Doe"
          autoStart={true}
          onCancel={() => {
            setShowPaystack(false);
          }}
          onSuccess={(res) => {
            setShowPaystack(false);
            verifyPayment(
              { outlet: "pharmacy", reference: res.transactionRef.reference },
              {
                onSuccess: (data) => {
                  if (data.status === "success") {
                    setShowSuccessModal(true);
                  } else {
                    alert("Payment verification failed ❌");
                  }
                },
                onError: () => {
                  alert("Something went wrong while verifying payment ❌");
                },
              }
            );
          }}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onButtonPress={() => {
          setShowSuccessModal(false);
          router.push("/pharmacy");
        }}
      />
    </ThemedView>
  );
};
export default MakePaymentScreen
const styles = StyleSheet.create({
  container: { padding: 30, flex: 1 },
  header: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingVertical: 20,
  },
  backText: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  subtitle: { fontSize: 12, lineHeight: 20, marginBottom: 10 },
  grid: {},
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 30,
    borderBottomWidth: 0.4,
    borderColor: "rgba(68, 68, 68, 0.5)",
    paddingBottom: 6,
  },
  gridLabel: { fontSize: 12, fontWeight: "500" },
  gridValue: { fontWeight: "500", fontSize: 12 },
});
