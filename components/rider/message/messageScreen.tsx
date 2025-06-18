import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { chatData } from "./chatData";
import { MessageTabSelector } from "./messageTab";
import ChatList from "./chatlist";
import { Colors } from "@/constants/Colors";

type TabType = "Read" | "Unread";

const MessageScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Unread");

  const filteredChats = chatData.filter((chat) =>
    activeTab === "Read" ? chat.read : !chat.read
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <MessageTabSelector activeTab={activeTab} onChange={setActiveTab} />
      <ChatList data={filteredChats} />
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Colors.light.background,
    paddingTop: 0,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
