import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useMessaging } from '@/hooks/useMessageHook';

// Types
interface Message {
  id: string;
  content: string;
  message_type: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  timestamp: string;
  created_at: string;
  display_time: string;
  optimistic?: boolean;
}

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

interface MessageMainProps {
  authToken: string;
  outlet: string;
  userData?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Individual Message Component
const MessageBubble: React.FC<{ 
  message: Message; 
  isCurrentUser: boolean;
  currentUserId: string;
}> = ({ message, isCurrentUser, currentUserId }) => {
  const isOptimistic = message.optimistic || false;
  
  return (
    <View style={[
      styles.messageBubble,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      isOptimistic && styles.optimisticMessage
    ]}>
      <View style={styles.messageHeader}>
        <Text style={[
          styles.senderName,
          isCurrentUser && styles.currentUserName
        ]}>
          {isCurrentUser ? 'You' : (message.user_name || 'Support')}
        </Text>
        <Text style={styles.messageTime}>
          {message.display_time || new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={[
        styles.messageContent,
        isCurrentUser && styles.currentUserContent
      ]}>
        {message.content}
      </Text>
      {isOptimistic && (
        <View style={styles.optimisticIndicator}>
          <ActivityIndicator size="small" color="#999" />
          <Text style={styles.optimisticText}>Sending...</Text>
        </View>
      )}
    </View>
  );
};

// Connection Status Component
const ConnectionStatus: React.FC<{
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  onRetry: () => void;
}> = ({ isConnected, isConnecting, connectionError, onRetry }) => {
  const getStatusColor = () => {
    if (connectionError) return '#ef4444';
    if (isConnecting) return '#f59e0b';
    if (isConnected) return '#10b981';
    return '#6b7280';
  };

  const getStatusText = () => {
    if (connectionError) return 'Connection Failed';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <View style={[styles.connectionStatus, { backgroundColor: getStatusColor() }]}>
      <View style={styles.connectionContent}>
        <Text style={styles.connectionText}>{getStatusText()}</Text>
        {connectionError && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
      {connectionError && (
        <Text style={styles.errorDetail}>{connectionError}</Text>
      )}
    </View>
  );
};

// Main Messaging Component
export const Messaging: React.FC<MessagingProps> = ({ 
  authToken, 
  outletType, 
  userData 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  const {
    messages,
    optimisticMessages,
    allMessages,
    isConnected,
    isConnecting,
    connectionError,
    isLoading,
    sendMessage,
    refreshMessages,
    clearOptimisticMessages,
    triggerMessageLoad,
    debugState,
    addTestMessage,
  } = useMessaging(authToken, outletType, userData);

  // Log allMessages whenever it changes
  useEffect(() => {
    console.log('📊 allMessages updated:', allMessages.length);
    console.log('📊 Current allMessages:', allMessages);
  }, [allMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages.length]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) {
      Alert.alert('Empty Message', 'Please enter a message before sending.');
      return;
    }

    if (!isConnected) {
      Alert.alert('Connection Error', 'Please wait for connection to be established.');
      return;
    }

    try {
      await sendMessage(newMessage.trim(), 'text');
      setNewMessage('');
      textInputRef.current?.blur();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Send Error', 'Failed to send message. Please try again.');
    }
  }, [newMessage, isConnected, sendMessage]);

  // Handle retry connection
  const handleRetryConnection = useCallback(() => {
    // The hook should handle reconnection automatically
    triggerMessageLoad();
  }, [triggerMessageLoad]);

  // Refresh messages
  const handleRefresh = useCallback(async () => {
    try {
      await refreshMessages();
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  }, [refreshMessages]);

  // Send test message
  const handleSendTestMessage = useCallback(() => {
    const testMessages = [
      "Hello! This is a test message.",
      "How are you doing today?",
      "Testing the messaging system!",
      "Can you receive this message?",
      "Great work on the chat feature!"
    ];
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    setNewMessage(randomMessage);
  }, []);

  const renderMessage = useCallback(({ item, index }: { item: Message, index: number }) => (
    <MessageBubble
      key={`message-${item.id}-${index}`}
      message={item}
      isCurrentUser={item.user_id === userData?.id}
      currentUserId={userData?.id || ''}
    />
  ), [userData?.id]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="message-circle" size={48} color="#d1d5db" />
      <Text style={styles.emptyStateTitle}>No messages yet</Text>
      <Text style={styles.emptyStateSubtitle}>Start a conversation by sending a message</Text>
      <View style={styles.emptyStateActions}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleSendTestMessage}
        >
          <Text style={styles.testButtonText}>Send Test Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.localTestButton} 
          onPress={addTestMessage}
        >
          <Text style={styles.localTestButtonText}>Add Local Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.loadingText}>Loading messages...</Text>
      <TouchableOpacity 
        style={styles.forceLoadButton}
        onPress={triggerMessageLoad}
      >
        <Text style={styles.forceLoadButtonText}>Force Load Messages</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.messagesHeader}>
      <Text style={styles.messagesTitle}>
        Messages ({allMessages.length})
      </Text>
      <View style={styles.messagesCounts}>
        <Text style={styles.countText}>
          Regular: {messages.length} | Optimistic: {optimisticMessages.length}
        </Text>
      </View>
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
        onRetry={handleRetryConnection}
      />

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Messages: {messages.length} | Optimistic: {optimisticMessages.length} | Total: {allMessages.length}
        </Text>
        <View style={styles.debugActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.debugButton}>
            <Feather name="refresh-cw" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={debugState} style={styles.debugButton}>
            <Feather name="info" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {renderHeader()}
        
        {isLoading && allMessages.length === 0 ? (
          renderLoadingState()
        ) : allMessages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item, index) => `${item.id}-${index}-${item.timestamp}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onRefresh={handleRefresh}
            refreshing={isLoading}
            extraData={allMessages.length} // Force re-render when message count changes
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={false} // Keep all messages in memory for better debugging
          />
        )}
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            ref={textInputRef}
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
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!isConnected || !newMessage.trim() || isConnecting) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!isConnected || !newMessage.trim() || isConnecting}
          >
            <Feather 
              name="send" 
              size={20} 
              color={(!isConnected || !newMessage.trim() || isConnecting) ? '#9ca3af' : '#fff'} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleSendTestMessage}
          >
            <Text style={styles.quickActionText}>Test Message</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={clearOptimisticMessages}
          >
            <Text style={styles.quickActionText}>Clear Optimistic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={triggerMessageLoad}
          >
            <Text style={styles.quickActionText}>Force Load</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={addTestMessage}
          >
            <Text style={styles.quickActionText}>Add Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Message Tab Main Component
export const MessageMain: React.FC<MessageMainProps> = ({
  authToken,
  outlet,
  userData
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [showLiveChat, setShowLiveChat] = useState(true);
  const navigation = useNavigation();

  const handleBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowLiveChat(!showLiveChat)}>
            <Feather 
              name={showLiveChat ? "eye-off" : "eye"} 
              size={24} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {['chat', 'faq'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as 'chat' | 'faq')}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'chat' ? (
          showLiveChat ? (
            <Messaging 
              authToken={authToken} 
              outletType={outlet}
              userData={userData}
            />
          ) : (
            <View style={styles.chatDisabled}>
              <Feather name="message-circle" size={48} color="#d1d5db" />
              <Text style={styles.chatDisabledText}>Live chat is hidden</Text>
              <TouchableOpacity 
                style={styles.enableChatButton}
                onPress={() => setShowLiveChat(true)}
              >
                <Text style={styles.enableChatText}>Show Live Chat</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.faqContainer}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <Text style={styles.faqSubtitle}>FAQ functionality would go here</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Main Container Styles
  mainContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    padding: 4,
  },
  
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#10b981',
    fontWeight: '600',
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  chatDisabled: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  chatDisabledText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  enableChatButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enableChatText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  messagesHeader: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  messagesCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#6b7280',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  faqContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Connection Status Styles
  connectionStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorDetail: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
  },
  
  // Debug Info Styles
  debugInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  
  // Messages Container Styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
 
  
  // Message Bubble Styles
  messageBubble: {
    marginBottom: 16,
    maxWidth: width * 0.8,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10b981',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optimisticMessage: {
    opacity: 0.7,
  },
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  localTestButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  localTestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  
  
  // Loading State Styles
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
  
  // Input Container Styles
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
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
    marginRight: 12,
  },
   
  debugActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  
  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  forceLoadButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  forceLoadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});

// Export default as MessageMain for easy usage
export default MessageMain;