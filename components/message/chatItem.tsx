import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const messages = [
  { id: '1', sender: 'user', text: 'Hi, I need help with my order.' },
  { id: '2', sender: 'support', text: 'Sure! What seems to be the issue?' },
];

const ChatDetailScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.supportBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-end',
  },
  supportBubble: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    color: '#1a202c',
  },
});

export default ChatDetailScreen;
