import { useCallback, useEffect, useRef, useState } from "react";

// Utility function to get active user
export const getActiveUser = () => {
  // Note: In React Native, you'd typically use AsyncStorage instead of localStorage
  // This is kept for compatibility with your existing code structure
  const userData = global.localStorage?.getItem('userData');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  return {
    id: global.localStorage?.getItem('userId') || global.localStorage?.getItem('user_id'),
    name: global.localStorage?.getItem('userName') || global.localStorage?.getItem('user_name'),
    email: global.localStorage?.getItem('userEmail') || global.localStorage?.getItem('user_email'),
    role: global.localStorage?.getItem('userRole') || 'user'
  };
};

// Mock user data for demonstration
const mockUserData = {
  id: "335b636e-9a9d-4cda-a509-49b1bd23550e",
  name: "User3 User",
  email: "user2@sephcocco.com", 
  role: "user"
};

export const useMessaging = (authToken, outletType = '', userData = mockUserData) => {
  console.log('🚀 useMessaging (React Native WebSocket) hook called');
  console.log('🔑 Auth token:', !!authToken);
  console.log('🏪 Outlet type:', outletType);
  console.log('👤 User data:', userData);
  
  // Refs
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const subscriptionRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);
  const messagesLoadedRef = useRef(false);
  const currentUserIdRef = useRef(userData?.id);
  const userDataRef = useRef(userData);
  const authTokenRef = useRef(authToken);
  const outletTypeRef = useRef(outletType);

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

  // Process new message (centralized logic)
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

  // Handle WebSocket messages (ActionCable protocol)
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Raw WebSocket message received:', data);

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
              loadMessages();
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

      // Handle direct real-time messages (not wrapped in ActionCable)
      if (data.type === 'new_message' || 
          data.type === 'broadcast_message' || 
          data.type === 'message_broadcast' || 
          data.type === 'message_updated' ||
          data.type === 'chat_message' ||
          data.broadcast === true) {
        
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

        console.log('📨 ActionCable message data:', messageData);

        // Handle user messages response
        if (messageData.type === 'user_messages_response') {
          console.log('📨 User messages response received:', messageData);
          
          if (messageData.messages) {
            const processedMessages = messageData.messages.map((msg) => ({
              ...msg,
              display_time: formatDisplayTime(msg.timestamp || msg.created_at)
            }));
            setMessages(processedMessages);
            console.log('✅ Loaded messages via ActionCable:', processedMessages.length);
          }
          setIsLoading(false);
          return;
        }

        // Handle real-time new messages via ActionCable
        if (messageData.type === 'new_message' || 
            messageData.type === 'broadcast_message' || 
            messageData.type === 'message_broadcast' || 
            messageData.type === 'message_updated' ||
            messageData.type === 'chat_message' ||
            messageData.broadcast === true) {
          
          processNewMessage(messageData, 'ActionCable');
          return;
        }

        // Handle ping/pong via ActionCable
        if (messageData.type === 'ping') {
          console.log('🏓 ActionCable ping received, responding with pong');
          sendActionCableMessage('pong', { message: messageData.message });
          return;
        }

        if (messageData.type === 'pong') {
          console.log('🏓 Pong response received - connection is working!');
          return;
        }

        // Handle errors
        if (messageData.error) {
          console.error('❌ WebSocket error received:', messageData.error);
          setConnectionError(messageData.error);
          return;
        }

        console.log('❓ Unknown ActionCable message type:', messageData.type);
      }

    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }, [processNewMessage, sendActionCableMessage]);

  // Separate function to handle channel subscription
  const subscribeToChannel = useCallback(() => {
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

  // Load messages
  const loadMessages = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot load messages: WebSocket not ready');
      return;
    }

    console.log('📤 Loading user messages...');
    setIsLoading(true);

    // Try ActionCable format first
    if (subscriptionRef.current?.confirmed) {
      console.log('📤 Loading via ActionCable...');
      const success = sendActionCableMessage('request_my_messages', {
        outlet_type: outletTypeRef.current,
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
      if (isLoading) {
        setIsLoading(false);
        console.log('⏰ Load messages timeout');
      }
    }, 10000);
  }, [isLoading, sendActionCableMessage]);

  // Try loading messages without ActionCable subscription
  const tryDirectMessageLoad = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot try direct message load: WebSocket not ready');
      return;
    }

    console.log('📤 Trying direct message load...');

    const directRequest = {
      action: 'request_my_messages',
      outlet_type: outletTypeRef.current,
      _function: 'loadUserMessages'
    };

    console.log('📤 Direct request:', directRequest);
    wsRef.current.send(JSON.stringify(directRequest));
  }, []);

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
        // Try subscribing after a short delay if no welcome
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
  }, [handleMessage, subscribeToChannel]);

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
  }, [startConnection, cleanup]);

  // Send message
  const sendMessage = useCallback(async (content, messageType = 'text') => {
    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to WebSocket');
    }

    if (!userData) {
      throw new Error('User data not available');
    }

    const messageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Create optimistic message
    const optimisticMessage = {
      id: messageId,
      content: content,
      message_type: messageType,
      user_id: userData.id,
      user_name: userData.name,
      user_email: userData.email,
      user_role: userData.role,
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
        user_id: userData.id,
        user_name: userData.name,
        user_email: userData.email,
        user_role: userData.role,
        timestamp: timestamp
      };

      // Try ActionCable format first
      if (subscriptionRef.current?.confirmed) {
        console.log('📤 Sending via ActionCable...');
        const success = sendActionCableMessage('receive', {
          message: messagePayload,
          outlet_type: outletTypeRef.current,
          _function: 'sendMessage'
        });

        if (!success) {
          throw new Error('Failed to send via ActionCable');
        }
      } else {
        // Send direct message format
        console.log('📤 Sending via direct WebSocket...');
        const directMessage = {
          action: 'receive',
          message: messagePayload,
          outlet_type: outletTypeRef.current,
          _function: 'sendMessage'
        };

        wsRef.current.send(JSON.stringify(directMessage));
      }

      console.log('✅ Message sent successfully');

      // Remove optimistic message after timeout if not confirmed
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
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== messageId));
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }, [userData, sendActionCableMessage]);

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
    };
  }, [authToken, outletType, connect, cleanup]);

  // Combine messages for display
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Debug logging for state
  useEffect(() => {
    console.log('📊 Messages state updated:', messages.length);
    console.log('📊 Optimistic messages state updated:', optimisticMessages.length);
    console.log('📊 All messages:', allMessages.length);
  }, [messages, optimisticMessages, allMessages]);

  // Public functions
  const refreshMessages = useCallback(async () => {
    messagesLoadedRef.current = false;
    loadMessages();
  }, [loadMessages]);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  const triggerMessageLoad = useCallback(() => {
    console.log('🔄 Manually triggering message load...');
    loadMessages();
  }, [loadMessages]);

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
      hasUserData: !!userData
    };
  }, [authToken, outletType, userData]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    isLoading,
    messages,
    optimisticMessages,
    allMessages,
    sendMessage,
    refreshMessages,
    clearOptimisticMessages,
    triggerMessageLoad,
    getConnectionInfo,
    sendPing,
    manualSubscribe
  };
};
