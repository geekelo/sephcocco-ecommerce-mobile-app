import { useCallback, useEffect, useRef, useState } from "react";
import { createConsumer } from '@rails/actioncable';

// Utility function to get active user
export const getActiveUser = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  // Fallback to individual localStorage items
  return {
    id: localStorage.getItem('userId') || localStorage.getItem('user_id'),
    name: localStorage.getItem('userName') || localStorage.getItem('user_name'),
    email: localStorage.getItem('userEmail') || localStorage.getItem('user_email'),
    role: localStorage.getItem('userRole') || 'user'
  };
};

// Mock user data for demonstration - FIXED to match backend logs
const mockUserData = {
  id: "335b636e-9a9d-4cda-a509-49b1bd23550e", // ✅ Match backend user ID
  name: "User3 User",
  email: "user2@sephcocco.com", 
  role: "user"
};

export const useMessaging = (authToken, outletType = '', userData = mockUserData) => {
  console.log('🚀 useMessaging (React Native) hook called');
  console.log('🔑 Auth token:', !!authToken);
  console.log('🏪 Outlet type:', outletType);
  console.log('👤 User data:', userData);
  
  // Refs
  const authTokenRef = useRef(authToken);
  const outletTypeRef = useRef(outletType);
  const subscriptionRef = useRef(null);
  const consumerRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);
  const currentUserIdRef = useRef(userData?.id);
  const messagesLoadedRef = useRef(false);
  const userDataRef = useRef(userData);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  // Update refs when props change
  useEffect(() => {
    authTokenRef.current = authToken;
    outletTypeRef.current = outletType;
    userDataRef.current = userData;
    currentUserIdRef.current = userData?.id;
  }, [authToken, outletType, userData]);

  // Format display time - FIXED to match web version
  const formatDisplayTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return new Date().toLocaleString();
    }
  };

  // Process new message (centralized logic) - ADDED FROM WEB VERSION
  const processNewMessage = useCallback((messageData, source) => {
    console.log(`🚨 Processing new message from ${source}:`, messageData);

    if (!messageData.content) {
      console.log('⚠️ No content in message, skipping');
      return;
    }

    const currentTimestamp = messageData.created_at || messageData.timestamp || new Date().toISOString();
    const senderId = messageData.sender_id || messageData.user?.id || messageData.user_id;
    const threadOwnerId = messageData.thread_owner_id || messageData.user_id || senderId;
    const isFromCurrentUser = userData && String(senderId) === String(userData.id);

    const newMessage = {
      id: messageData.id || `msg-${Date.now()}-${Math.random()}`,
      content: messageData.content,
      message_type: messageData.message_type || 'text',
      user_id: senderId || '',
      user_name: isFromCurrentUser ? 'You' : (messageData.user?.name || messageData.sender?.name || messageData.user_name || 'Support'),
      user_email: messageData.user_email || messageData.sender?.email || messageData.user?.email || '',
      user_role: messageData.user_role || messageData.sender?.role || messageData.user?.role || 'support',
      timestamp: currentTimestamp,
      created_at: currentTimestamp,
      display_time: formatDisplayTime(currentTimestamp)
    };

    // Check if message belongs to current user conversation
    const isMyConversation = (
      !threadOwnerId || 
      (userData && String(threadOwnerId) === String(userData.id)) ||
      isFromCurrentUser ||
      messageData.broadcast === true ||
      (userData && String(messageData.user_id) === String(userData.id))
    );

    console.log('🔍 Message belongs to current user:', isMyConversation);

    if (isMyConversation) {
      // Remove matching optimistic message if it's from current user
      if (isFromCurrentUser) {
        console.log('🔄 Removing matching optimistic message');
        setOptimisticMessages(prev => 
          prev.filter(opt => opt.content !== newMessage.content)
        );
      }

      // Add to messages if not duplicate
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg.id === newMessage.id || 
          (msg.content === newMessage.content && 
           Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000)
        );
        
        if (exists) {
          console.log('⚠️ Duplicate message, skipping');
          return prev;
        }
        
        console.log(`✅ Adding ${source} real-time message`);
        return [...prev, newMessage];
      });
    } else {
      console.log('⚠️ Message not for current user, ignoring');
    }
  }, [userData]);

  // Load user messages via WebSocket ONLY
  const loadUserMessages = useCallback(async () => {
    console.log('📤 Loading user messages via WebSocket for user:', currentUserIdRef.current);
    
    if (!subscriptionRef.current) {
      console.log('❌ Cannot load user messages: No subscription');
      return;
    }

    if (!isConnected) {
      console.log('❌ Cannot load user messages: WebSocket not connected yet');
      return;
    }

    if (!currentUserIdRef.current) {
      console.error('❌ Cannot load user messages: No user ID available');
      return;
    }

    setIsLoading(true);
    console.log('🔄 Setting loading state to true');

    try {
      // FIXED: Use the exact same format as web version
      const requestData = {
        action: 'request_my_messages',
        outlet_type: outletTypeRef.current,
        _function: 'loadUserMessages'
      };
      
      console.log('📤 Requesting user messages via WebSocket:', requestData);
      
      // Send using both methods like in web version
      subscriptionRef.current.send(requestData);
      console.log('📤 send() called successfully');
      
      // Also try perform method as fallback
      setTimeout(() => {
        console.log('📤 Fallback: Sending request via perform method...');
        subscriptionRef.current.perform('receive', requestData);
        console.log('📤 Fallback data sent via perform');
      }, 100);
      
      // Set a timeout to handle no response
      setTimeout(() => {
        if (isLoading) {
          console.log('⏰ No response received within 10 seconds, setting loading to false');
          setIsLoading(false);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error loading user messages via WebSocket:', error);
      setIsLoading(false);
    }
  }, [isConnected, isLoading]);

  // Auto-load messages when connection becomes active
  useEffect(() => {
    if (isConnected && subscriptionRef.current && currentUserIdRef.current && !messagesLoadedRef.current) {
      console.log('🔄 Connection is active, loading messages...');
      messagesLoadedRef.current = true;
      
      setTimeout(() => {
        try {
          loadUserMessages();
        } catch (error) {
          console.error('Error auto-loading messages:', error);
        }
      }, 2000);
    }
  }, [isConnected, loadUserMessages]);

  // Send message via WebSocket
  const sendMessage = useCallback(async (content, messageType = 'text', productId = null) => {
    console.log('📤 SEND_MESSAGE called with content:', content);
    
    if (!subscriptionRef.current || !isConnected) {
      console.error('Cannot send message: not connected');
      throw new Error('WebSocket not connected');
    }

    if (!content || content.trim() === '') {
      console.error('Cannot send empty message');
      throw new Error('Message content cannot be empty');
    }

    if (!currentUserIdRef.current) {
      console.error('❌ Cannot send message: No user ID available');
      throw new Error('User ID not available');
    }

    const user = userDataRef.current || getActiveUser();
    const messageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    console.log('📤 User sending message:', content);
    console.log('📤 Current user:', user);
    console.log('📤 Current user ID ref:', currentUserIdRef.current);
    
    // Create optimistic message - FIXED format to match web version
    const optimisticMessage = {
      id: messageId,
      content: content,
      message_type: messageType,
      user_id: currentUserIdRef.current,
      user_name: user?.name || 'You',
      user_email: user?.email || '',
      user_role: user?.role || 'user',
      timestamp: timestamp,
      created_at: timestamp,
      optimistic: true,
      display_time: formatDisplayTime(timestamp)
    };

    // Add optimistic message immediately
    console.log('📤 Adding optimistic message:', optimisticMessage);
    setOptimisticMessages(prev => {
      const newOptimistic = [...prev, optimisticMessage];
      console.log('📤 Optimistic messages count:', prev.length, '->', newOptimistic.length);
      return newOptimistic;
    });

    // Create message data for Rails backend - EXACT SAME AS WEB VERSION
    const messageData = {
      action: 'receive',
      message: {
        content: content,
        message_type: messageType,
        user_id: currentUserIdRef.current,
        user_name: user?.name || 'User',
        user_email: user?.email || '',
        user_role: user?.role || 'user',
        timestamp: timestamp
      },
      outlet_type: outletTypeRef.current,
      _function: 'sendMessage'
    };

    // Add product_id if provided
    if (productId) {
      messageData.product_id = productId;
    }

    console.log('📤 Sending message data to backend:', JSON.stringify(messageData, null, 2));
    
    try {
      // Send using the 'receive' action via perform
      subscriptionRef.current.perform('receive', messageData);
      console.log('✅ Message sent successfully via WebSocket perform method');
      
      // Set timeout to clean up optimistic message if not confirmed by real-time update
      const timeoutId = setTimeout(() => {
        console.log('⏰ Checking optimistic message timeout for:', messageId);
        setOptimisticMessages(prev => {
          const stillExists = prev.find(msg => msg.id === messageId);
          if (stillExists) {
            console.log('⏰ Optimistic message still exists after timeout, converting to permanent');
            setMessages(current => {
              const alreadyExists = current.find(msg => 
                msg.content === stillExists.content && 
                Math.abs(new Date(msg.timestamp).getTime() - new Date(stillExists.timestamp).getTime()) < 10000
              );
              if (!alreadyExists) {
                console.log('⏰ Adding timeout message as permanent');
                const permanentMessage = { ...stillExists, optimistic: false };
                return [...current, permanentMessage];
              } else {
                console.log('⏰ Real message already exists, skipping permanent conversion');
              }
              return current;
            });
            return prev.filter(msg => msg.id !== messageId);
          }
          return prev;
        });
      }, 8000);
      
      console.log('📤 Set cleanup timeout for message:', messageId);
      
    } catch (error) {
      console.error('❌ Error sending message via WebSocket:', error);
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== messageId));
      throw error;
    }
  }, [isConnected]);

  // WebSocket connection using ActionCable
  const connect = useCallback(() => {
    console.log('🔐 React Native Connect function called');
    
    if (!authTokenRef.current || !outletTypeRef.current) {
      const error = 'No authentication token or outlet type provided';
      setConnectionError(error);
      return;
    }

    if (connectionAttemptedRef.current || isConnecting || isConnected) {
      console.log('🔐 Connection already attempted or in progress, skipping...');
      return;
    }

    // Check if we already have active connections
    if (subscriptionRef.current || consumerRef.current) {
      console.log('🔐 Existing connection found, cleaning up first...');
      disconnect();
      return;
    }

    connectionAttemptedRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);
    messagesLoadedRef.current = false;

    console.log('🔐 React Native attempting to connect...');
    console.log('📝 Token (first 20 chars):', authTokenRef.current.substring(0, 20) + '...');
    console.log('🏪 Outlet type:', outletTypeRef.current);
    console.log('👤 Current user ID:', currentUserIdRef.current);

    try {
      // Create Action Cable consumer with token as query parameter
      consumerRef.current = createConsumer(`wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authTokenRef.current)}`);

      console.log('✅ Consumer created, attempting to subscribe...');

      // Subscribe to messaging channel
      subscriptionRef.current = consumerRef.current.subscriptions.create(
        {
          channel: "MessagingChannel",
          outlet_type: outletTypeRef.current
        },
        {
          connected() {
            setIsConnected(true);
            setIsConnecting(false);
            setConnectionError(null);
            console.log('🎉 React Native successfully connected to messaging channel');
            console.log('📡 Channel: messaging_user_' + currentUserIdRef.current);
            console.log('🏪 Outlet type:', outletTypeRef.current);
            
            // Load user messages when connected
            setTimeout(() => {
              if (subscriptionRef.current && currentUserIdRef.current && !messagesLoadedRef.current) {
                console.log('⏰ Loading user messages after connection...');
                messagesLoadedRef.current = true;
                loadUserMessages();
              }
            }, 2000);
            
            // Send a ping to test connection
            setTimeout(() => {
              if (subscriptionRef.current) {
                console.log('🏓 Sending ping to test connection...');
                subscriptionRef.current.send({ type: 'ping', timestamp: Date.now() });
              }
            }, 3000);
          },

          disconnected() {
            setIsConnected(false);
            setIsConnecting(false);
            connectionAttemptedRef.current = false;
            messagesLoadedRef.current = false;
            console.log('💔 React Native disconnected from messaging channel');
          },

          rejected() {
            setIsConnected(false);
            setIsConnecting(false);
            connectionAttemptedRef.current = false;
            messagesLoadedRef.current = false;
            setConnectionError('Failed to connect to messaging channel - authentication may have failed');
            console.log('❌ React Native failed to connect to messaging channel - subscription rejected');
          },

          received(data) {
            console.log('📨 React Native received WebSocket message:', data);
            console.log('📨 Message type:', data.type);
            console.log('📨 Full message data:', JSON.stringify(data, null, 2));
            
            // Handle ping/pong - MATCHING WEB VERSION
            if (data.type === 'ping') {
              console.log('🏓 Ping received, responding with pong');
              if (subscriptionRef.current) {
                const pongResponse = {
                  type: 'pong',
                  message: data.message
                };
                subscriptionRef.current.send(pongResponse);
                console.log('🏓 Pong sent:', pongResponse);
              }
              return;
            }
            
            if (data.type === 'pong') {
              console.log('🏓 Pong response received - connection is working!');
              return;
            }
            
            // Handle test response
            if (data.type === 'test_response') {
              console.log('🧪 Test response received:', data);
              return;
            }
            
            // Handle user messages response from WebSocket - IMPROVED MATCHING WEB VERSION
            if (data.type === 'user_messages_response') {
              console.log('📨 User messages response received:', data);
              console.log('📨 Messages count:', data.messages?.length || 0);
              
              if (data.messages) {
                const processedMessages = data.messages.map(msg => ({
                  ...msg,
                  display_time: formatDisplayTime(msg.timestamp || msg.created_at)
                }));
                setMessages(processedMessages);
                console.log('✅ Loaded messages via ActionCable:', processedMessages.length);
              }
              setIsLoading(false);
              return;
            }
            
            // Handle real-time new messages - USING CENTRALIZED PROCESSING FROM WEB VERSION
            if (data.type === 'new_message' || 
                data.type === 'broadcast_message' || 
                data.type === 'message_broadcast' || 
                data.type === 'message_updated' ||
                data.type === 'chat_message' ||
                data.broadcast === true) {
              
              console.log('🚨 REAL-TIME: React Native received new message!');
              processNewMessage(data, 'ActionCable');
              return;
            }
            
            // Handle direct message responses (not wrapped in ActionCable) - FROM WEB VERSION
            if (data.type === 'user_messages_response') {
              console.log('📨 Direct user messages response received:', data);
              
              if (data.messages) {
                const processedMessages = data.messages.map((msg) => ({
                  ...msg,
                  display_time: formatDisplayTime(msg.timestamp || msg.created_at)
                }));
                setMessages(processedMessages);
                console.log('✅ Loaded messages (direct):', processedMessages.length);
              }
              setIsLoading(false);
              return;
            }

            // Handle direct real-time messages (not wrapped in ActionCable) - FROM WEB VERSION
            if (data.type === 'new_message' || 
                data.type === 'broadcast_message' || 
                data.type === 'message_broadcast' || 
                data.type === 'message_updated' ||
                data.type === 'chat_message' ||
                data.broadcast === true) {
              
              processNewMessage(data, 'direct');
              return;
            }
            
            // Handle errors
            if (data.error) {
              console.error('❌ WebSocket error received:', data.error);
              setConnectionError(data.error);
              setIsLoading(false);
              return;
            }
            
            // Log unknown message types
            console.log('❓ Unknown message type received:', data.type);
          }
        }
      );

    } catch (err) {
      const errorMsg = 'Failed to create WebSocket connection';
      console.error('❌ Failed to create WebSocket:', err);
      setIsConnected(false);
      setIsConnecting(false);
      connectionAttemptedRef.current = false;
      messagesLoadedRef.current = false;
      setConnectionError(errorMsg);
    }
  }, [loadUserMessages, processNewMessage]);

  const disconnect = useCallback(() => {
    console.log('🧹 React Native cleaning up connection...');
    
    // Reset connection flags first
    connectionAttemptedRef.current = false;
    autoConnectAttemptedRef.current = false;
    messagesLoadedRef.current = false;
    
    // Clean up subscription
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.log('⚠️ Error unsubscribing:', error);
      }
      subscriptionRef.current = null;
    }
    
    // Clean up consumer
    if (consumerRef.current) {
      try {
        consumerRef.current.disconnect();
      } catch (error) {
        console.log('⚠️ Error disconnecting consumer:', error);
      }
      consumerRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Auto-connect
  useEffect(() => {
    console.log('🔌 React Native Auto-connect useEffect triggered');
    
    if (authToken && outletType && !autoConnectAttemptedRef.current && !isConnected && !isConnecting) {
      console.log('🚀 React Native auto-connecting to WebSocket...');
      autoConnectAttemptedRef.current = true;
      connect();
    }

    return () => {
      console.log('🧹 React Native cleaning up WebSocket connection...');
      disconnect();
      autoConnectAttemptedRef.current = false;
    };
  }, [authToken, outletType, connect, disconnect]);

  // Function to refresh messages
  const refreshMessages = useCallback(async () => {
    messagesLoadedRef.current = false;
    await loadUserMessages();
  }, [loadUserMessages]);

  // Function to clear optimistic messages
  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  // ADDED FROM WEB VERSION - Additional helper functions
  const triggerMessageLoad = useCallback(() => {
    console.log('🔄 Manually triggering message load...');
    loadUserMessages();
  }, [loadUserMessages]);

  const getConnectionInfo = useCallback(() => {
    return {
      subscriptionRef: !!subscriptionRef.current,
      consumerRef: !!consumerRef.current,
      isConnected,
      connectionAttempted: connectionAttemptedRef.current,
      messagesLoaded: messagesLoadedRef.current,
      hasAuthToken: !!authToken,
      hasOutletType: !!outletType,
      hasUserData: !!userData
    };
  }, [isConnected, authToken, outletType, userData]);

  const sendPing = useCallback(() => {
    console.log('🏓 Sending manual ping...');
    if (subscriptionRef.current && isConnected) {
      subscriptionRef.current.send({ type: 'ping', timestamp: Date.now() });
    } else {
      console.log('❌ Cannot send ping: not connected');
    }
  }, [isConnected]);

  const manualSubscribe = useCallback(() => {
    console.log('🔧 Manual subscription triggered');
    if (consumerRef.current && authTokenRef.current && outletTypeRef.current) {
      connect();
    }
  }, [connect]);

  // Combine messages and optimistic messages for display
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Loading state
    isLoading,
    
    // Data
    messages, // Confirmed messages from server
    optimisticMessages, // Messages being sent
    allMessages, // Combined for display
    
    // Actions
    sendMessage,
    refreshMessages,
    clearOptimisticMessages,
    triggerMessageLoad,
    getConnectionInfo,
    sendPing,
    manualSubscribe
  };
};
