import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "../ui/CustomButton";
import { Colors } from "@/constants/Colors";
import PaymentModal from "../modal/payment";
import { SuccessModal } from "../modal/sucess";
import { router } from "expo-router";

export const MakePaymentScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      {/* Go Back Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.light.orange} />
        </TouchableOpacity>
        <ThemedText
          fontFamily="Raleway-Regular"
          style={[styles.backText, { color: Colors.light.orange }]}
        >
          Go Back
        </ThemedText>
        <View />
      </View>
      <ThemedView
        style={{
          backgroundColor: Colors.light.pink,
          padding: 24,
          marginVertical: 30,
          margin: 20,
        }}
      >
        <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
          Make Payment
        </ThemedText>

        <ThemedText
          fontFamily="Raleway-Regular"
          style={[styles.subtitle, { color: theme.text }]}
        >
          Thank you for your order. Please select a payment method by clicking
          the buttons below. You will be redirected to a secure page where you
          can make a transfer.
        </ThemedText>

        {/* Order Details Grid */}
        <View style={styles.grid}>
          {Object.entries(orderDetails).map(([label, value]) => (
            <View style={styles.gridRow} key={label}>
              <ThemedText
                fontFamily="Raleway-Regular"
                style={[styles.gridLabel, { color: "#000" }]}
              >
                {label.replace(/([A-Z])/g, " $1")}
              </ThemedText>
              <ThemedText
                fontFamily="Raleway-Regular"
                style={[styles.gridValue, { color: theme.gray }]}
              >
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
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 30, flex: 1 },
  header: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingVertical: 20,
  },
  backText: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 20 },
  subtitle: { fontSize: 8, lineHeight: 20, marginBottom: 10 },
  grid: {},
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 30,
    borderBottomWidth: 0.4,
    borderColor: "rgba(68, 68, 68, 0.5)",
    paddingBottom: 6,
  },
  gridLabel: { fontSize: 9, fontWeight: 500 },
  gridValue: { fontWeight: 500, fontSize: 9 },

  label: { fontWeight: 600, fontSize: 13 },
});
