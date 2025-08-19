import { useCallback, useEffect, useRef, useState } from "react";

// Utility function to get active user - React Native compatible
export const getActiveUser = () => {
  try {
    const userData = global.localStorage?.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    return {
      id: global.localStorage?.getItem('userId') || global.localStorage?.getItem('user_id'),
      name: global.localStorage?.getItem('userName') || global.localStorage?.getItem('user_name'),
      email: global.localStorage?.getItem('userEmail') || global.localStorage?.getItem('user_email'),
      role: global.localStorage?.getItem('userRole') || 'user'
    };
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return null;
  }
};

// Mock user data for demonstration
const mockUserData = {
  id: "335b636e-9a9d-4cda-a509-49b1bd23550e",
  name: "User3 User",
  email: "user2@sephcocco.com", 
  role: "user"
};

export const useMessaging = (authToken, outletType = '', userData = mockUserData) => {
  console.log('🚀 useMessaging (React Native) hook called');
  console.log('🔑 Auth token:', !!authToken);
  console.log('🏪 Outlet type:', outletType);
  console.log('👤 User data:', userData);
  
  // Refs for React Native WebSocket
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const subscriptionRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);
  const messagesLoadedRef = useRef(false);
  const authTokenRef = useRef(authToken);
  const outletTypeRef = useRef(outletType);
  const currentUserIdRef = useRef(userData?.id);
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

  // Format display time
  const formatDisplayTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return new Date().toLocaleString();
    }
  };

  // Send message via ActionCable protocol
  const sendActionCableMessage = useCallback((action, data) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ Cannot send message: WebSocket not connected');
      return false;
    }

    if (!subscriptionRef.current?.confirmed) {
      console.error('❌ Cannot send message: Subscription not confirmed');
      return false;
    }

    const message = {
      command: 'message',
      identifier: subscriptionRef.current.identifier,
      data: JSON.stringify({
        action: action,
        ...data
      })
    };

    console.log('📤 Sending ActionCable message:', message);
    wsRef.current.send(JSON.stringify(message));
    return true;
  }, []);

  // Process new message (centralized logic) - FIXED to match backend broadcast format
  const processNewMessage = useCallback((messageData, source) => {
    console.log(`🚨 Processing new message from ${source}:`, JSON.stringify(messageData, null, 2));

    if (!messageData.content) {
      console.log('⚠️ No content in message, skipping');
      return;
    }

    const currentTimestamp = messageData.created_at || messageData.timestamp || new Date().toISOString();
    
    // FIXED: Use correct sender info from backend broadcast format
    const senderId = messageData.sender_id || messageData.user?.id || messageData.user_id;
    const threadOwnerId = messageData.thread_owner_id || messageData.user_id;
    const isFromCurrentUser = userData && String(senderId) === String(userData.id);

    console.log('🔍 Message analysis:');
    console.log('   - Sender ID:', senderId);
    console.log('   - Thread Owner ID:', threadOwnerId);
    console.log('   - Current User ID:', userData?.id);
    console.log('   - Is from current user:', isFromCurrentUser);

    const newMessage = {
      id: messageData.chat_id || messageData.id || `msg-${Date.now()}-${Math.random()}`,
      content: messageData.content,
      message_type: messageData.message_type || 'text',
      user_id: senderId || '',
      user_name: isFromCurrentUser ? 'You' : (messageData.user?.name || messageData.sender?.name || messageData.user_name || 'Support'),
      user_email: messageData.user_email || messageData.user?.email || '',
      user_role: messageData.user_role || messageData.user?.role || 'support',
      timestamp: currentTimestamp,
      created_at: currentTimestamp,
      display_time: formatDisplayTime(currentTimestamp)
    };

    // FIXED: Check if message belongs to current user's conversation
    const isMyConversation = (
      // If I'm the thread owner (this is my conversation)
      String(threadOwnerId) === String(userData?.id) ||
      // If I sent the message
      isFromCurrentUser ||
      // If it's explicitly broadcast to me
      messageData.broadcast === true ||
      // Fallback: if user_id matches current user
      String(messageData.user_id) === String(userData?.id)
    );

    console.log('🔍 Message belongs to current user:', isMyConversation);
    console.log('🔍 Conversation check details:');
    console.log('   - Thread owner matches:', String(threadOwnerId) === String(userData?.id));
    console.log('   - Is from current user:', isFromCurrentUser);
    console.log('   - Is broadcast:', messageData.broadcast === true);

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
           Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 2000)
        );
        
        if (exists) {
          console.log('⚠️ Duplicate message, skipping');
          return prev;
        }
        
        console.log(`✅ Adding ${source} real-time message:`, newMessage);
        return [...prev, newMessage];
      });
    } else {
      console.log('⚠️ Message not for current user, ignoring');
    }
  }, [userData]);

  // Load user messages via WebSocket - FIXED to use correct backend method
  const loadUserMessages = useCallback(async () => {
    console.log('📤 loadUserMessages called');
    console.log('📤 Current user ID:', currentUserIdRef.current);
    console.log('📤 Outlet type:', outletTypeRef.current);
    console.log('📤 WebSocket ready:', wsRef.current?.readyState === WebSocket.OPEN);
    console.log('📤 Subscription confirmed:', subscriptionRef.current?.confirmed);
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot load messages: WebSocket not ready');
      return;
    }

    if (!isConnected) {
      console.log('❌ Cannot load messages: Not connected');
      return;
    }

    if (!currentUserIdRef.current) {
      console.error('❌ Cannot load messages: No user ID');
      return;
    }

    setIsLoading(true);
    console.log('🔄 Setting loading state to true');

    try {
      // FIXED: Use the exact method name that the backend expects
      if (subscriptionRef.current?.confirmed) {
        console.log('📤 Loading via ActionCable subscription...');
        const success = sendActionCableMessage('request_my_messages', {
          outlet_type: outletTypeRef.current,
          user_id: currentUserIdRef.current,
          _function: 'loadUserMessages'
        });

        if (!success) {
          console.log('📤 ActionCable failed, trying direct...');
          tryDirectMessageLoad();
        }
      } else {
        console.log('📤 No subscription confirmed, trying direct...');
        tryDirectMessageLoad();
      }
      
      // Timeout if no response
      setTimeout(() => {
        console.log('⏰ Message load timeout - setting loading to false');
        setIsLoading(false);
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setIsLoading(false);
    }
  }, [isConnected, sendActionCableMessage]);

  // Try loading messages without ActionCable subscription
  const tryDirectMessageLoad = useCallback(() => {
    console.log('📤 tryDirectMessageLoad called');
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot try direct load: WebSocket not ready');
      return;
    }

    console.log('📤 Trying direct message load...');

    // FIXED: Use the exact action name the backend expects
    const directRequest = {
      action: 'request_my_messages',
      outlet_type: outletTypeRef.current,
      user_id: currentUserIdRef.current,
      _function: 'loadUserMessages'
    };

    console.log('📤 Direct request:', JSON.stringify(directRequest));
    wsRef.current.send(JSON.stringify(directRequest));
    console.log('📤 Direct request sent');
  }, []);

  // Handle WebSocket messages (ActionCable protocol)
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Raw WebSocket message received:', JSON.stringify(data, null, 2));

      // Handle ping messages from Rails backend
      if (data.type === 'ping') {
        console.log('🏓 Ping received from server, responding with pong');
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const pongResponse = {
            type: 'pong',
            message: data.message
          };
          wsRef.current.send(JSON.stringify(pongResponse));
          console.log('🏓 Pong sent:', pongResponse);
        }
        return;
      }

      // Handle ActionCable welcome message
      if (data.type === 'welcome') {
        console.log('🎉 ActionCable welcome received');
        setTimeout(() => {
          console.log('📡 Subscribing after welcome...');
          subscribeToChannel();
        }, 500);
        return;
      }

      // Handle subscription confirmation
      if (data.type === 'confirm_subscription') {
        console.log('✅ Subscription confirmed:', data.identifier);
        
        if (subscriptionRef.current && data.identifier === subscriptionRef.current.identifier) {
          subscriptionRef.current.confirmed = true;
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionError(null);
          
          console.log('✅ Connection state updated - now connected');
          
          // Load messages after subscription is confirmed
          setTimeout(() => {
            if (!messagesLoadedRef.current) {
              console.log('⏰ Loading messages after subscription confirmation...');
              messagesLoadedRef.current = true;
              loadUserMessages();
            }
          }, 1000);
        }
        return;
      }

      // Handle subscription rejection
      if (data.type === 'reject_subscription') {
        console.error('❌ Subscription rejected');
        setConnectionError('Subscription rejected - authentication may have failed');
        setIsConnected(false);
        setIsConnecting(false);
        return;
      }

      // Handle direct message responses (not wrapped in ActionCable)
      if (data.type === 'user_messages_response') {
        console.log('📨 Direct user messages response received:', data);
        console.log('📨 Messages count:', data.messages?.length || 0);
        
        if (data.messages) {
          const processedMessages = data.messages.map(msg => ({
            ...msg,
            display_time: formatDisplayTime(msg.timestamp || msg.created_at)
          }));
          console.log('📨 Setting messages from direct response:', processedMessages.length);
          setMessages(processedMessages);
        }
        setIsLoading(false);
        return;
      }

      // Handle real-time messages - FIXED to match backend broadcast format
      if (data.type === 'new_message' || 
          data.type === 'broadcast_message' || 
          data.type === 'message_broadcast' || 
          data.type === 'message_updated' ||
          data.type === 'chat_message' ||
          data.broadcast === true) {
        
        console.log('🚨 REAL-TIME: Direct message received!');
        console.log('🚨 Message details:', {
          type: data.type,
          content: data.content,
          sender_id: data.sender_id,
          thread_owner_id: data.thread_owner_id,
          user_id: data.user_id
        });
        processNewMessage(data, 'direct');
        return;
      }

      // Handle ActionCable wrapped messages
      if (data.identifier && data.command === 'message' && data.data) {
        let messageData;
        try {
          messageData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        } catch (e) {
          messageData = data.data;
        }

        console.log('📨 ActionCable wrapped message:', JSON.stringify(messageData, null, 2));

        // Handle user messages response via ActionCable
        if (messageData.type === 'user_messages_response') {
          console.log('📨 User messages response via ActionCable:', messageData);
          
          if (messageData.messages) {
            const processedMessages = messageData.messages.map(msg => ({
              ...msg,
              display_time: formatDisplayTime(msg.timestamp || msg.created_at)
            }));
            console.log('📨 Setting messages from ActionCable response:', processedMessages.length);
            setMessages(processedMessages);
          }
          setIsLoading(false);
          return;
        }

        // Handle real-time messages via ActionCable - FIXED
        if (messageData.type === 'new_message' || 
            messageData.type === 'broadcast_message' || 
            messageData.type === 'message_broadcast' || 
            messageData.type === 'message_updated' ||
            messageData.type === 'chat_message' ||
            messageData.broadcast === true) {
          
          console.log('🚨 REAL-TIME: ActionCable wrapped message received!');
          console.log('🚨 Wrapped message details:', {
            type: messageData.type,
            content: messageData.content,
            sender_id: messageData.sender_id,
            thread_owner_id: messageData.thread_owner_id,
            user_id: messageData.user_id
          });
          processNewMessage(messageData, 'ActionCable');
          return;
        }

        // Handle ping/pong via ActionCable
        if (messageData.type === 'ping') {
          console.log('🏓 ActionCable ping received, responding with pong');
          sendActionCableMessage('pong', { message: messageData.message });
          return;
        }

        console.log('❓ Unknown ActionCable message type:', messageData.type);
      }

    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }, [processNewMessage, sendActionCableMessage, loadUserMessages]);

  // Separate function to handle channel subscription
  const subscribeToChannel = useCallback(() => {
    console.log('📡 subscribeToChannel called');
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot subscribe: WebSocket not ready');
      return;
    }
    
    const identifier = JSON.stringify({
      channel: 'MessagingChannel',
      outlet_type: outletTypeRef.current
    });
    
    const subscribeMessage = {
      command: 'subscribe',
      identifier: identifier
    };
    
    console.log('📡 Subscribing to channel:', subscribeMessage);
    wsRef.current.send(JSON.stringify(subscribeMessage));
    
    subscriptionRef.current = {
      identifier: identifier,
      confirmed: false
    };
    
    console.log('📡 Subscription stored:', subscriptionRef.current);
  }, []);

  // Auto-load messages when connection becomes active
  useEffect(() => {
    if (isConnected && wsRef.current && currentUserIdRef.current && !messagesLoadedRef.current) {
      console.log('🔄 Connection is active, auto-loading messages...');
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

  // Clean up connection
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up connection...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    subscriptionRef.current = null;
    connectionAttemptedRef.current = false;
    autoConnectAttemptedRef.current = false;
    messagesLoadedRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Start WebSocket connection
  const startConnection = useCallback(() => {
    setIsConnecting(true);
    setConnectionError(null);
    messagesLoadedRef.current = false;

    console.log('🔐 Starting React Native WebSocket connection...');

    try {
      const wsUrl = `wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authTokenRef.current)}`;
      console.log('🔗 WebSocket URL:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🎉 React Native WebSocket connection opened');
        
        // ActionCable should send a welcome message automatically
        setTimeout(() => {
          if (!subscriptionRef.current?.confirmed) {
            console.log('⏰ No welcome received, trying immediate subscription...');
            subscribeToChannel();
          }
        }, 2000);
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('💔 React Native WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        connectionAttemptedRef.current = false;
        messagesLoadedRef.current = false;
        
        if (subscriptionRef.current) {
          subscriptionRef.current.confirmed = false;
        }
        
        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && authTokenRef.current && outletTypeRef.current) {
          console.log('🔄 Reconnecting in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnected && !isConnecting) {
              console.log('🔄 Attempting reconnection...');
              connectionAttemptedRef.current = false;
              connect();
            }
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ React Native WebSocket error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
        setIsConnecting(false);
        connectionAttemptedRef.current = false;
      };

    } catch (error) {
      console.error('❌ Failed to create React Native WebSocket:', error);
      setConnectionError('Failed to create connection');
      setIsConnecting(false);
      connectionAttemptedRef.current = false;
    }
  }, [handleMessage, subscribeToChannel, isConnected, isConnecting]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    console.log('🔐 React Native Connect function called');
    
    if (!authTokenRef.current || !outletTypeRef.current) {
      console.log('❌ Missing auth token or outlet type');
      setConnectionError('Missing auth token or outlet type');
      return;
    }

    if (connectionAttemptedRef.current || isConnecting || isConnected) {
      console.log('🔐 Connection already attempted or in progress, skipping...');
      return;
    }

    if (wsRef.current) {
      console.log('🔐 Existing WebSocket found, cleaning up first...');
      cleanup();
      setTimeout(() => {
        connectionAttemptedRef.current = true;
        startConnection();
      }, 100);
      return;
    }

    connectionAttemptedRef.current = true;
    startConnection();
  }, [startConnection, cleanup, isConnecting, isConnected]);

  // Send message via WebSocket - FIXED to match backend format
  const sendMessage = useCallback(async (content, messageType = 'text', productId = null) => {
    console.log('📤 SEND_MESSAGE called with content:', content);
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
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
    
    // Create optimistic message
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

    console.log('📤 Adding optimistic message:', optimisticMessage);
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      const messagePayload = {
        content: content,
        message_type: messageType,
        user_id: currentUserIdRef.current,
        user_name: user?.name || 'User',
        user_email: user?.email || '',
        user_role: user?.role || 'user',
        timestamp: timestamp
      };

      // FIXED: Send message using the backend's expected format
      if (subscriptionRef.current?.confirmed) {
        console.log('📤 Sending via ActionCable...');
        const success = sendActionCableMessage('receive', {
          message: messagePayload,
          outlet_type: outletTypeRef.current,
          product_id: productId,
          _function: 'sendMessage'
        });

        if (!success) {
          throw new Error('Failed to send via ActionCable');
        }
      } else {
        console.log('📤 Sending via direct WebSocket...');
        const directMessage = {
          action: 'receive',
          message: messagePayload,
          outlet_type: outletTypeRef.current,
          _function: 'sendMessage'
        };

        if (productId) {
          directMessage.product_id = productId;
        }

        wsRef.current.send(JSON.stringify(directMessage));
      }

      console.log('✅ Message sent successfully');

      // Clean up optimistic message after timeout
      setTimeout(() => {
        setOptimisticMessages(prev => {
          const stillExists = prev.find(msg => msg.id === messageId);
          if (stillExists) {
            console.log('⏰ Converting optimistic message to permanent');
            setMessages(current => {
              const alreadyExists = current.find(msg => 
                msg.content === stillExists.content && 
                Math.abs(new Date(msg.timestamp).getTime() - new Date(stillExists.timestamp).getTime()) < 10000
              );
              if (!alreadyExists) {
                return [...current, { ...stillExists, optimistic: false }];
              }
              return current;
            });
          }
          return prev.filter(msg => msg.id !== messageId);
        });
      }, 8000);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== messageId));
      throw error;
    }
  }, [sendActionCableMessage]);

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
      cleanup();
      autoConnectAttemptedRef.current = false;
    };
  }, [authToken, outletType, connect, cleanup, isConnected, isConnecting]);

  // Debug logging for state
  useEffect(() => {
    console.log('📊 Messages state updated:', messages.length);
    console.log('📊 Messages array:', messages);
    console.log('📊 Optimistic messages state updated:', optimisticMessages.length);
    console.log('📊 All messages:', allMessages.length);
  }, [messages, optimisticMessages]);

  // Combine messages for display
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Public functions
  const refreshMessages = useCallback(async () => {
    messagesLoadedRef.current = false;
    await loadUserMessages();
  }, [loadUserMessages]);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  const triggerMessageLoad = useCallback(() => {
    console.log('🔄 Manually triggering message load...');
    console.log('🔄 Current connection state:', {
      isConnected,
      wsState: wsRef.current?.readyState,
      subscriptionConfirmed: subscriptionRef.current?.confirmed,
      hasUser: !!currentUserIdRef.current,
      hasOutlet: !!outletTypeRef.current
    });
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (subscriptionRef.current?.confirmed) {
        console.log('🔄 Triggering via ActionCable...');
        sendActionCableMessage('request_my_messages', {
          outlet_type: outletTypeRef.current,
          user_id: currentUserIdRef.current,
          _function: 'manualLoad'
        });
      } else {
        console.log('🔄 Triggering via direct WebSocket...');
        const requestData = {
          action: 'request_my_messages',
          outlet_type: outletTypeRef.current,
          user_id: currentUserIdRef.current,
          _function: 'manualLoad'
        };
        
        console.log('🔄 Manual request data:', requestData);
        wsRef.current.send(JSON.stringify(requestData));
      }
    } else {
      console.log('❌ Cannot trigger message load - WebSocket not ready');
    }
  }, [isConnected, sendActionCableMessage]);

  const sendPing = useCallback(() => {
    console.log('🏓 Sending manual ping...');
    if (subscriptionRef.current?.confirmed) {
      sendActionCableMessage('ping', { timestamp: Date.now() });
    } else if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    } else {
      console.log('❌ Cannot send ping: not connected');
    }
  }, [sendActionCableMessage]);

  const manualSubscribe = useCallback(() => {
    console.log('🔧 Manual subscription triggered');
    subscribeToChannel();
  }, [subscribeToChannel]);

  const getConnectionInfo = useCallback(() => {
    return {
      wsState: wsRef.current?.readyState,
      wsUrl: wsRef.current?.url,
      subscriptionIdentifier: subscriptionRef.current?.identifier,
      subscriptionConfirmed: subscriptionRef.current?.confirmed,
      connectionAttempted: connectionAttemptedRef.current,
      messagesLoaded: messagesLoadedRef.current,
      hasAuthToken: !!authToken,
      hasOutletType: !!outletType,
      hasUserData: !!userData,
      isConnected,
      isConnecting,
      isLoading
    };
  }, [authToken, outletType, userData, isConnected, isConnecting, isLoading]);

  // Return all the hook's functionality
  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    isLoading,
    
    // Messages
    messages,
    optimisticMessages,
    allMessages,
    
    // Actions
    sendMessage,
    refreshMessages,
    clearOptimisticMessages,
    triggerMessageLoad,
    
    // Debug/utility functions
    getConnectionInfo,
    sendPing,
    manualSubscribe,
    
    // Connection management
    connect,
    cleanup
  };
};
