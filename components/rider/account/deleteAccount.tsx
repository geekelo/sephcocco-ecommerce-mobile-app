import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
 
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import PageTemplate from "./pageTemplate";
import { CustomOutlineButton } from "@/components/ui/CustomOutlineButton";
import CustomButton from "@/components/ui/CustomButton";

export default function DeleteAccount() {
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = () => {
    if (confirmText.toLowerCase() !== "delete") {
      Alert.alert("Error", 'Please type "Delete" to confirm.');
      return;
    }

    // TODO: Replace with actual delete account logic
    Alert.alert("Deleted", "Your account has been deleted.");
  };

  return (
    <View style={styles.container}>
      <PageTemplate title="Delete Account" />
      {/* Header */}

      {/* Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="trash-outline" size={100} color="#fff" />
        </View>
        <Text style={styles.warningText}>
          This action cannot be undone. All your data will be permanently
          removed from our servers.
        </Text>
      </View>

      {/* What will be deleted */}
      <View style={styles.deletionBox}>
        <Text style={styles.listItemText}>What will be deleted:</Text>
        {[
          "Your profile and account information",
          "All photos, videos, and posts",
          "Messages and conversations",
          "Settings and preferences",
          "Purchase history and subscriptions",
        ].map((item, index) => (
          <View style={styles.listItemRow} key={index}>
            <Entypo
              name="dot-single"
              size={12}
              color="black"
              style={styles.bulletIcon}
            />

            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Confirmation Input */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.confirmLabel}>Type Delete here to confirm</Text>
        <TextInput
          placeholder="Type Delete here"
          value={confirmText}
          onChangeText={setConfirmText}
          style={styles.input}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <CustomOutlineButton
          style={styles.cancelBtn}
          title="Cancel"
          onPress={() => router.back()}
        />
        <CustomButton
          style={styles.deleteBtn}
          onPress={handleDelete}
          text="Delete Account"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  iconWrapper: {
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: Colors.light.orange,
    borderRadius: 100,
    padding: 30,
    marginBottom: 36,
  },
  warningText: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: 14,
    paddingHorizontal: 100,
    fontFamily: "Raleway",
    lineHeight: 24,
  },
  deletionBox: {
    backgroundColor: "rgba(249, 58, 1, 0.1)",
    borderRadius: 8,
    padding: 16,
    marginTop: 34,
  },
  listItem: {
    fontSize: 12,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  confirmLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 60,
    alignItems: "center",
    gap: 8,
  },
  cancelBtn: {
    width: "40%",
  },

  deleteBtn: {
    width: "40%",
  },

  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  bulletIcon: {
    marginRight: 4,
  },
  listItemText: {
    fontSize: 12,
    color: Colors.light.text,

    lineHeight: 24,
  },
});
