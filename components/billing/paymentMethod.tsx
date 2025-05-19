import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PaymentModal from "../modal/payment";
import { SuccessModal } from "../modal/sucess";
import { router } from "expo-router";

type PaymentMethodProps = {
  address: string;
  product: { price: number };
  quantity: number;
};

export default function PaymentMethod({
  address,
  product,
  quantity,
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "online" | null>(
    null
  );
  const [showBankDetails, setShowBankDetails] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const itemTotal = product.price * quantity;
  const totalCost = itemTotal;
  const handleBankTransfer = () => {
    setPaymentMethod("bank");
    setShowBankDetails(true);
    setShowModal(true); // show immediately on selection
  };

  const handleOnlinePayment = () => {
    setPaymentMethod("online");
    setShowBankDetails(false);
  };

  const paymentDetails = [
    { label: "Account Number:", value: "1234567890" },
    { label: "Bank Name:", value: "SmartSphere Inc." },
    { label: "Reference Code:", value: "#REF1234" },
  ];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "bank" && styles.paymentOptionSelected,
            ]}
            onPress={handleBankTransfer}
          >
            <View style={styles.paymentOptionInner}>
              <MaterialCommunityIcons name="bank" size={24} color="#4a5568" />
              <Text style={styles.paymentOptionLabel}>Bank Transfer</Text>
              {paymentMethod === "bank" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4299e1"
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "online" && styles.paymentOptionSelected,
            ]}
            onPress={handleOnlinePayment}
          >
            <View style={styles.paymentOptionInner}>
              <MaterialCommunityIcons
                name="credit-card"
                size={24}
                color="#4a5568"
              />
              <Text style={styles.paymentOptionLabel}>Online Payment</Text>
              {paymentMethod === "online" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4299e1"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.orderTotalSection}>
        <View style={styles.orderTotalRow}>
          <Text style={styles.orderTotalLabel}>Subtotal</Text>
          <Text style={styles.orderTotalValue}>${itemTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.orderTotalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${totalCost.toFixed(2)}</Text>
        </View>
      </View>
      


      <PaymentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Make Payment"
        details={paymentDetails}
        onConfirm={() => {
          setShowModal(false);
          setTimeout(() => setShowSuccessModal(true), 300);
        }}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onButtonPress={() => {
          setShowSuccessModal(false);
          router.push("/pharmacy");
        }}
      />

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          (!paymentMethod || (paymentMethod === "bank" && !address)) &&
            styles.checkoutButtonDisabled,
        ]}
        disabled={!paymentMethod || (paymentMethod === "bank" && !address)}
        onPress={() => {
          if (paymentMethod === "bank") {
            setShowModal(true);
          } else if (paymentMethod === "online") {
            setTimeout(() => {
              setShowSuccessModal(true);
            }, 300);
          }
        }}
      >
        <Text style={styles.checkoutButtonText}>
          {paymentMethod === "bank" ? "Complete Order" : "Proceed to Payment"}
        </Text>
      </TouchableOpacity>

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
  container: {
    margin:16
  },
  paymentSection: {
    marginBottom: 20,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#2d3748",
  },
  paymentOptions: {
    flexDirection: "column",
    gap: 6,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  paymentOptionSelected: {
    borderColor: "#4299e1",
    backgroundColor: "#ebf8ff",
  },
  paymentOptionInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentOptionLabel: {
    fontWeight: "500",
    fontSize: 16,
    color: "#000",
    flex: 1,
    marginLeft: 16,
  },
  orderTotalSection: {
    marginTop: "auto",
    marginBottom: 32,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
  },
  orderTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderTotalLabel: {
    fontSize: 16,
    color: "#4a5568",
  },
  orderTotalValue: {
    fontSize: 16,
    color: "#4a5568",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e1e4e8",
    paddingTop: 16,
    marginTop: 16,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
  },
  checkoutButton: {
    backgroundColor: "#3182ce",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#a0aec0",
  },
  checkoutButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
});
