import { useMessaging } from '@/hooks/useSendMessage';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface MessagingProps {
  authToken: string;
  outletType: string;
  userData?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  display_time: string;
  optimistic?: boolean;
}

const MessageBubble: React.FC<{ 
  message: Message; 
  isCurrentUser: boolean;
}> = ({ message, isCurrentUser }) => (
  <View style={[
    styles.messageBubble,
    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
    message.optimistic && styles.optimisticMessage
  ]}>
    <View style={styles.messageHeader}>
      <Text style={[styles.senderName, isCurrentUser && styles.currentUserName]}>
        {isCurrentUser ? 'You' : message.user_name}
      </Text>
      <Text style={styles.messageTime}>
        {message.display_time}
      </Text>
    </View>
    <Text style={[styles.messageContent, isCurrentUser && styles.currentUserContent]}>
      {message.content}
    </Text>
    {message.optimistic && (
      <View style={styles.optimisticIndicator}>
        <ActivityIndicator size="small" color="#999" />
        <Text style={styles.optimisticText}>Sending...</Text>
      </View>
    )}
  </View>
);

const ConnectionStatus: React.FC<{
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}> = ({ isConnected, isConnecting, connectionError }) => {
  const getStatusColor = () => {
    if (connectionError) return '#ef4444';
    if (isConnecting) return '#f59e0b';
    if (isConnected) return '#10b981';
    return '#6b7280';
  };

  const getStatusText = () => {
    if (connectionError) return `❌ ${connectionError}`;
    if (isConnecting) return '🟡 Connecting...';
    if (isConnected) return '🟢 Connected';
    return '🔴 Disconnected';
  };

  return (
    <View style={[styles.connectionStatus, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.connectionText}>{getStatusText()}</Text>
    </View>
  );
};

export const Messaging: React.FC<MessagingProps> = ({ 
  authToken, 
  outletType, 
  userData 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const {
    allMessages,
    isConnected,
    isConnecting,
    connectionError,
    isLoading,
    sendMessage,
    refreshMessages,
  } = useMessaging(authToken, outletType, userData);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isCurrentUser={userData ? item.user_id === userData.id : false}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No messages yet</Text>
      <Text style={styles.emptyStateSubtitle}>Start a conversation by sending a message</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectionError={connectionError}
      />

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : allMessages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onRefresh={refreshMessages}
            refreshing={isLoading}
          />
        )}
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
          editable={isConnected && !isConnecting}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isConnected || !newMessage.trim() || isConnecting) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!isConnected || !newMessage.trim() || isConnecting}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Connection Status
  connectionStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  // Messages Container
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Message Bubble
  messageBubble: {
    marginBottom: 16,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optimisticMessage: {
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  currentUserName: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1f2937',
  },
  currentUserContent: {
    color: '#ffffff',
  },
  optimisticIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  optimisticText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 6,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Loading State
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  
  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Messaging;