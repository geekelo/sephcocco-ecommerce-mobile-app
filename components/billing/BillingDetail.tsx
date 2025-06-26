import React, { useEffect, useState } from "react";
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
import { getUser } from "@/lib/tokenStorage";
import { useCreateOrder, useGetAllOrders } from "@/mutation/useOrders";
import { useOutlet } from "@/context/outletContext";
const BillingDetails = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { activeOutlet } = useOutlet();
  const [filterOpen, setFilterOpen] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const filterOptions = [
    "Price: Low to High",
    "Price: High to Low",
    "Newest First",
    "Categories",
    "Rating",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUserId(user?.id ?? null);
      setIsUserLoaded(true);
    };
    fetchUser();
  }, []);

  const { mutate, isPending: isCreating , data} = useCreateOrder(activeOutlet ?? "");

  const { data: orderItem = [], isLoading: isOrdersLoading } = useGetAllOrders(
    activeOutlet ?? "",
    userId
  );

  const toggleFilter = () => setFilterOpen(!filterOpen);

  const orderTotal = orderItem.reduce((sum, item) => {
    const itemPrice = Number(item?.price ?? 0);
    const quantity = Number(item?.quantity ?? 1);
    return sum + itemPrice * quantity;
  }, 0);

  const handlePlaceOrder = () => {
    if (!userId || !activeOutlet) {
      alert("Missing user or outlet.");
      return;
    }

    if (!orderItem.length) {
      alert("No items to order.");
      return;
    }

    orderItem.forEach((item) => {
      mutate({
        product_id: item.id,
        quantity: item.quantity,
        outlet: activeOutlet,
        address: "Sample Address, Nigeria",
        phone_number: "08012345678",
        additional_notes: deliveryNote,
      });
    });

    alert("✅ Orders placed successfully!");
    setTimeout(() => {
      router.push("/Payment");
    }, 500); // Delay for visual feedback
  };
console.log('creating data', data)
console.log(orderItem)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SearchBar
        filterOptions={filterOptions}
        onFilterToggle={toggleFilter}
        filterOpen={filterOpen}
      />

      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={10} color={theme.orange} />
        </TouchableOpacity>
        <ThemedText style={[styles.subtitle, { color: theme.orange }]}>
          Go Back
        </ThemedText>
        <View />
      </View>

      <ThemedText style={styles.title}>Billing Details</ThemedText>

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

      <InputField label="Address" />
      <InputField label="Email" />

      <View style={styles.addressToggleRow}>
        <ThemedText style={styles.label}>Ship to a different address?</ThemedText>
        <TouchableOpacity onPress={() => setShipToDifferentAddress(!shipToDifferentAddress)}>
          <Ionicons
            name={shipToDifferentAddress ? "checkbox-outline" : "square-outline"}
            size={20}
            color={theme.gray}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.wrapper}>
        <ThemedText style={styles.label}>Delivery Note</ThemedText>
        <TextInput
          multiline
          value={deliveryNote}
          onChangeText={setDeliveryNote}
          style={styles.textarea}
          placeholder="Write any notes..."
        />
      </View>

      <ThemedView style={{ paddingVertical: 50 }}>
        <ThemedText style={styles.orderTitle}>Your Order</ThemedText>

        {isOrdersLoading ? (
          <ThemedText>Loading orders...</ThemedText>
        ) : orderItem.length === 0 ? (
          <ThemedText>No orders yet.</ThemedText>
        ) : (
          orderItem.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText>
                ₦{Number(item.price).toFixed(2)} × {item.quantity}
              </ThemedText>
            </View>
          ))
        )}

        <View style={styles.orderItem}>
          <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
            ORDER TOTAL
          </ThemedText>
          <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
            ₦{orderTotal.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setReceiveEmails(!receiveEmails)}>
            <Ionicons
              name={receiveEmails ? "checkbox-outline" : "square-outline"}
              size={20}
              color={theme.gray}
            />
          </TouchableOpacity>
          <ThemedText style={{ color: "#4A4A4A", fontSize: 11 }}>
            I would like to receive exclusive emails with discounts and product info
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
          <ThemedText style={{ color: "#4A4A4A", fontSize: 11 }}>
            Save this information for next time
          </ThemedText>
        </View>

        <View style={{ paddingVertical: 30 }}>
          <CustomButton
            text={isCreating ? "Placing Order..." : "Place an Order"}
            disabled={!isUserLoaded || isCreating}
            onPress={handlePlaceOrder}
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
