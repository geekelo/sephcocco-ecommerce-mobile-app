import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../ui/InputField";
import { SearchBar } from "../common/SearchBar";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "../ThemedView";
import CustomButton from "../ui/CustomButton";
import { router } from "expo-router";

const BillingDetails = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [filterOpen, setFilterOpen] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);
  const filterOptions = [
    "Price: Low to High",
    "Price: High to Low",
    "Newest First",
    "Categories",
    "Rating",
  ];

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  const orderItems = [
    { name: "Modern Sofa", price: 230 },
    { name: "Wooden Chair", price: 120 },
    { name: "Floor Lamp", price: 80 },
    { name: "Coffee Table", price: 150 },
  ];

  const orderTotal = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SearchBar
        filterOptions={filterOptions}
        onFilterToggle={toggleFilter}
        filterOpen={filterOpen}
      />
      {/* Header with back button */}

      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={10} color={theme.orange} />
        </TouchableOpacity>
        <ThemedText
          fontFamily="Raleway-Regular"
          style={[styles.subtitle, { color: theme.orange }]}
        >
          Go Back
        </ThemedText>
        <View /> {/* Placeholder for spacing */}
      </View>

      <ThemedText fontFamily="Raleway-Regular" style={styles.title}>
        Billing Details
      </ThemedText>

      {/* Grid Fields */}
      <View style={styles.grid2}>
        <View style={{ width: "48%" }}>
          <InputField label="First Name" required />
        </View>
        <View style={{ width: "48%" }}>
          <InputField label="Last Name" required />
        </View>
      </View>
      <View style={styles.grid2}>
        <View style={{ width: "48%" }}>
          <InputField label="Country" />
        </View>
        <View style={{ width: "48%" }}>
          <InputField label="State" />
        </View>
      </View>

      {/* Full-width fields */}
      <InputField label="Address" />
      <InputField label="Email" />

      {/* Address Type Chips + Checkbox */}
      <View style={styles.addressToggleRow}>
        <ThemedText fontFamily="Raleway-Regular" style={styles.label}>
          Ship to a different address?
        </ThemedText>
        <TouchableOpacity
          onPress={() => setShipToDifferentAddress(!shipToDifferentAddress)}
        >
          <Ionicons
            name={
              shipToDifferentAddress ? "checkbox-outline" : "square-outline"
            }
            size={20}
            color={theme.gray}
          />
        </TouchableOpacity>
      </View>

      {/* Notes Textarea */}
      <View style={styles.wrapper}>
        <ThemedText fontFamily="Raleway-Regular" style={styles.label}>
          Delivery Note
        </ThemedText>
        <TextInput
          multiline
          style={styles.textarea}
          placeholder="Write any notes..."
        />
      </View>

      <ThemedView style={{ paddingVertical: 50 }}>
        {/* Order Summary */}

        <ThemedText fontFamily="Raleway-Regular" style={styles.orderTitle}>
          Your Order
        </ThemedText>
        {orderItems.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <ThemedText fontFamily="Raleway-Regular">{item.name}</ThemedText>
            <ThemedText fontFamily="Raleway-Regular">
              ${item.price.toFixed(2)}
            </ThemedText>
          </View>
        ))}
        <View style={styles.orderItem}>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontWeight: 700, fontSize: 16 }}
            fontFamily="Raleway-Regular"
          >
            ORDER TOTAL
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontWeight: 700, fontSize: 16 }}
            fontFamily="Raleway-Regular"
          >
            ${orderTotal.toFixed(2)}
          </ThemedText>
        </View>

        {/* Checkboxes */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setReceiveEmails(!receiveEmails)}>
            <Ionicons
              name={receiveEmails ? "checkbox-outline" : "square-outline"}
              size={20}
              color={theme.gray}
            />
          </TouchableOpacity>
          <ThemedText
            fontFamily="Raleway-Regular"
            style={{ color: "#4A4A4A", fontSize: 11 }}
          >
            I would like to receive exclusive emails with discounts and product
            information
          </ThemedText>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setSaveInfo(!saveInfo)}>
            <Ionicons
              name={saveInfo ? "checkbox-outline" : "square-outline"}
              size={20}
              color={theme.gray}
            />
          </TouchableOpacity>
          <ThemedText
            fontFamily="Raleway-Regular"
            style={{ color: "#4A4A4A", fontSize: 11 }}
          >
            Save this information for next time
          </ThemedText>
        </View>

        <View style={{ paddingVertical: 30 }}>
          <CustomButton
            text="Place an Order"
            onPress={() => {
              router.push("/Payment");
            }}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 30 },
  header: {
    flexDirection: "row",
    gap: 1,
    alignItems: "center",
    paddingVertical: 40,
  },
  title: { fontSize: 18, fontWeight: 600, paddingBottom: 30 },
  subtitle: { fontSize: 15, fontWeight: 500 },
  grid2: { flexDirection: "row", justifyContent: "space-between", flex: 1 },
  wrapper: { marginVertical: 20 },
  label: { fontWeight: 600, marginBottom: 5, color: "#4A4A4A", fontSize: 10 },
  textarea: {
    borderWidth: 0.3,
    borderRadius: 4,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    borderColor: "rgba(68, 68, 68, 0.7)",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 50,
    backgroundColor: "#eee",
    marginRight: 10,
  },
  addressTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  orderTitle: {
    fontSize: 21,
    marginVertical: 10,
    fontWeight: 600,
    paddingVertical: 30,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  addressToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 40,
  },
  ordergrid: { flexDirection: "row", justifyContent: "space-between", gap: 20 },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 20,
    fontSize: 14,
    color: "#4A4A4A",
    fontWeight: 600,
  },
});

export default BillingDetails;
