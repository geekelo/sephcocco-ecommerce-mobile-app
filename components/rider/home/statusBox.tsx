// components/StatusBox.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface StatusBoxProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  selected?: boolean;
}


const StatusBox: React.FC<StatusBoxProps> = ({ icon, label, onPress, selected }) => {
  return (
  <TouchableOpacity
  onPress={onPress}
  style={[styles.box, selected && styles.selectedBox]}
>
  <View style={styles.icon}>{icon}</View>
  <Text style={styles.label}>{label}</Text>
</TouchableOpacity>

  );
};

export default StatusBox;

const styles = StyleSheet.create({
  box: {
  width: "48%", // leaves space for gap
  marginBottom: 12,
  backgroundColor: Colors.light.background,
  paddingVertical: 20,
  paddingHorizontal: 12,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.33)',
},

  icon: {
    marginBottom: 8,
  },
  label: {
    fontFamily: "raleway",
    fontSize: 12,
    
    textAlign: "center",
    fontWeight:500,
    paddingVertical:8
  },
  selectedBox: {
  backgroundColor: Colors.light.gray + "20", // 20% opacity
  
},

});
