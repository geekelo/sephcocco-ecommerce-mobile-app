import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

import { MobilePaymentHistoryCard } from "./paymentHistory";
import { useOutlet } from "@/context/outletContext";
import { useFetchPayments } from "@/mutation/usePayment";

export const PaymentHistoryScreen = () => {
  const { activeOutlet } = useOutlet();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, error } = useFetchPayments({
    outlet: activeOutlet ?? "",
    status: statusFilter,
  });
console.log(data)
  const payments = data?.data ?? [];
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Payment History</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Paid:</Text>
        <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center" }}>
          Failed to load payments
        </Text>
      ) : (
        <MobilePaymentHistoryCard
          payments={payments}
          onStatusFilterChange={setStatusFilter}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#e0f2f1",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#333",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e7d32",
  },
});
