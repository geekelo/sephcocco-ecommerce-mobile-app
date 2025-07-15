import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PaymentModal from "../modal/payment";
import { SuccessModal } from "../modal/sucess";
import { router } from "expo-router";
import { usePayment } from "@/mutation/usePayment";
import { getUser } from "@/lib/tokenStorage";
import { useOutlet } from "@/context/outletContext";

type PaymentMethodProps = {
  address: string;
  product: { price: number };
  quantity: number;
  orderIds: string[];
};

export default function PaymentMethod({
  address,
  product,
  quantity,
  orderIds = [],
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "online" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { activeOutlet } = useOutlet();
  const { mutate: submitPayment, isPending: isSubmitting, data } = usePayment();

  const itemTotal = product.price * quantity;
  const totalCost = itemTotal;

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getUser();
      console.log("🧑‍💼 User fetched from storage:", u);
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleBankTransfer = () => {
    console.log("🏦 Bank transfer selected");
    setPaymentMethod("bank");
    setShowModal(true);
  };

  const handleOnlinePayment = () => {
    console.log("💳 Online payment selected");
    setPaymentMethod("online");
    setShowModal(false);
  };

  const handleBankPaymentConfirm = () => {
    console.log("✅ Confirm bank transfer clicked");

    if (!activeOutlet) {
      console.warn("❌ Missing outlet info");
      alert("Missing outlet info.");
      return;
    }

    if (!orderIds.length) {
      console.warn("❌ No order IDs provided");
      alert("No order ID provided.");
      return;
    }

    console.log("📦 Order IDs:", orderIds);
    console.log("🛒 Product info:", product);
    console.log("💰 Total cost:", totalCost);
    console.log("🏷️ Payment reference:", user?.payment_ref);
    console.log("📍 Outlet:", activeOutlet);

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
          console.log("✅ Payment submitted successfully");
          setShowModal(false);
          setTimeout(() => setShowSuccessModal(true), 300);
        },
        onError: (err) => {
          console.error("❌ Payment failed:", err);
          alert("Payment failed. Try again.");
        },
      }
    );
  };

  const paymentDetails = [
    { label: "Account Number:", value: "1234567890" },
    { label: "Bank Name:", value: "SmartSphere Inc." },
    { label: "Reference Code:", value: user?.payment_ref ?? "N/A" },
  ];

  console.log("🔄 Payment response:", data);

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
              <MaterialCommunityIcons name="credit-card" size={24} color="#4a5568" />
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
          <Text style={styles.orderTotalValue}>₦{itemTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.orderTotalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>₦{totalCost.toFixed(2)}</Text>
        </View>
      </View>

      <PaymentModal
        visible={showModal}
        onClose={() => {
          console.log("🛑 Payment modal closed");
          setShowModal(false);
        }}
        title="Make Payment"
        details={paymentDetails}
        onConfirm={handleBankPaymentConfirm}
        isLoading={isSubmitting}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          console.log("🎉 Success modal closed");
          setShowSuccessModal(false);
        }}
        onButtonPress={() => {
          console.log("🔁 Redirecting to /pharmacy");
          setShowSuccessModal(false);
          router.push("/pharmacy");
        }}
      />

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          (!paymentMethod || (paymentMethod === "bank" && !address)) && styles.checkoutButtonDisabled,
        ]}
        disabled={!paymentMethod || (paymentMethod === "bank" && !address)}
        onPress={() => {
          if (paymentMethod === "bank") {
            console.log("👆 'I HAVE PAID' clicked");
            setShowModal(true);
          } else if (paymentMethod === "online") {
            console.log("💸 Proceeding with online payment");
            setTimeout(() => {
              setShowSuccessModal(true);
            }, 300);
          }
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutButtonText}>
            {paymentMethod === "bank" ? "I HAVE PAID" : "Proceed to Online Payment"}
          </Text>
        )}
      </TouchableOpacity>
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
