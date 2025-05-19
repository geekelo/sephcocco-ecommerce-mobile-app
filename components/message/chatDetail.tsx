import { Entypo, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';



interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  highlighted?: boolean;
}

const MobileChatDetail = ({ chatItem, onBackClick }: any) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'agent',
      text: 'Hi Kitsbase. Let me know you need help and you can ask us any questions.',
      time: '08:20 AM',
    },
    {
      id: 2,
      sender: 'user',
      text: 'How to create a FinX Stock account?',
      time: '08:21 AM',
      highlighted: true,
    },
    {
      id: 3,
      sender: 'agent',
      text: 'Open the FinX Stock app to get started. There is no fee to create or maintain your account.',
      time: '08:22 AM',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: chatMessages.length + 1,
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, newMessage]);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackClick} style={styles.backButton}>
          <Entypo name='chevron-left' />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
 
          <Text style={styles.headerText}>{chatItem?.title || 'Chat Support'}</Text>
      <FlatList
        style={styles.messages}
        data={chatMessages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageRow,
              item.sender === 'user' ? styles.userRow : styles.agentRow,
            ]}
          >
            {item.sender === 'agent' && (
              <Image source={require('../../assets/images/logo.png')} style={styles.avatar} />
            )}
            <View
              style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userBubble : styles.agentBubble,
                item.highlighted && styles.highlightedBubble,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
         
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MobileChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 0,
   
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    padding:16,
    color: '#111',
     borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
   
    color: '#111',
    
  },
  messages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  agentRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#f9fafb',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  agentBubble: {
    backgroundColor: '#f3f4f6',
  },
  userBubble: {
    backgroundColor: '#ffecef',
  },
  highlightedBubble: {
    backgroundColor: '#ffecef',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  sendButton: {
    width: 40,
    height: 40,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
