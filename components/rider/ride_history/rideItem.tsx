import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  orderNumber: string;
  status: string;
  description?: string;
  date?: string;
  type: "Upcoming" | "Completed" | "Rejected";
}

const RideItem: React.FC<Props> = ({ orderNumber, status, description, type, date }) => (
  <View style={styles.item}>
    <View style={styles.row}>
      <Text style={styles.order}>Order #{orderNumber}</Text>
      
      <Text style={styles.status}>{status}</Text>
    </View>
     <Text style={styles.description}>{description}</Text>
    <View style={styles.divider} />
  </View>
);

export default RideItem;

const styles = StyleSheet.create({
  item: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  order: {
    fontWeight: "600",
  },
  status: {
    color: "#54B175",
    fontWeight: "500",
  },
  description: {
    color: "#555",
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 10,
  },
});
