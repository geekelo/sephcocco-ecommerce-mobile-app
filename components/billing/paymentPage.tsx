// PaymentHistoryScreen.tsx
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

  const { data, isLoading, error } = useFetchPayments({
    outlet: activeOutlet ?? "",
  });

  // Keep all payments in state
  const payments = (data?.payments ?? []).map((p: any) => ({
    date: p.created_at,
    status: p.status,
    amount: Number(p.amount) || 0,
    reference: p.transaction_id,
    orderNumber: p.orders?.[0] ?? "—",
    paymentMethod: p.payment_method ?? "—",
  }));

  // ✅ Always sort descending (newest first)
  const sortedPayments = payments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalAmount = sortedPayments.reduce((sum, p) => sum + p.amount, 0);

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
       
        <MobilePaymentHistoryCard payments={sortedPayments} />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#202020",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e7d32",
  },
});
