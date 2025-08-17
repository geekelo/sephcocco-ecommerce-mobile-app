import { useCallback, useEffect, useRef, useState } from 'react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

interface WebSocketMessage {
  type?: string;
  id?: string;
  content?: string;
  message_type?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  sender_id?: string;
  timestamp?: string;
  created_at?: string;
  messages?: Message[];
  error?: string;
  user?: User;
  sender?: User;
  thread_owner_id?: string;
  broadcast?: boolean;
  identifier?: string;
  command?: string;
  data?: any;
  message?: any;
}

interface MessagingHookReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  isLoading: boolean;
  messages: Message[];
  optimisticMessages: Message[];
  allMessages: Message[];
  sendMessage: (content: string, messageType?: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearOptimisticMessages: () => void;
  triggerMessageLoad: () => void;
  getConnectionInfo: () => any;
  sendPing: () => void;
  manualSubscribe: () => void;
}

// ActionCable subscription management
interface ActionCableSubscription {
  identifier: string;
  confirmed: boolean;
}

// Singleton instance tracker to prevent multiple connections
let activeInstance: string | null = null;

export const useMessaging = (
  authToken: string, 
  outletType: string = '', 
  userData?: User
): MessagingHookReturn => {
  const instanceId = useRef(`instance-${Date.now()}-${Math.random()}`);
  
  console.log('🚀 useMessaging (TypeScript) hook initialized');
  console.log('🆔 Instance ID:', instanceId.current);
  console.log('🔑 Auth token:', !!authToken);
  console.log('🏪 Outlet type:', outletType);
  console.log('👤 User data:', userData);
  
  // Check if this should be the active instance
  useEffect(() => {
    if (!activeInstance) {
      activeInstance = instanceId.current;
      console.log('✅ This instance is now active:', instanceId.current);
    } else if (activeInstance !== instanceId.current) {
      console.log('⚠️ Another instance is already active:', activeInstance);
    }
    
    return () => {
      if (activeInstance === instanceId.current) {
        activeInstance = null;
        console.log('🧹 Active instance cleaned up:', instanceId.current);
      }
    };
  }, []);
  
  const isActiveInstance = activeInstance === instanceId.current;
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<ActionCableSubscription | null>(null);
  const messagesLoadedRef = useRef(false);
  const connectionAttemptedRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  // Format display time
  const formatDisplayTime = (timestamp: string): string => {
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
  const sendActionCableMessage = useCallback((action: string, data: any) => {
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

  // Process new message (centralized logic)
  const processNewMessage = useCallback((messageData: any, source: string) => {
    console.log(`🚨 Processing new message from ${source}:`, messageData);

    if (!messageData.content) {
      console.log('⚠️ No content in message, skipping');
      return;
    }

    const currentTimestamp = messageData.created_at || messageData.timestamp || new Date().toISOString();
    const senderId = messageData.sender_id || messageData.user?.id || messageData.user_id;
    const threadOwnerId = messageData.thread_owner_id || messageData.user_id || senderId;
    const isFromCurrentUser = userData && String(senderId) === String(userData.id);

    const newMessage: Message = {
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
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
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
          const processedMessages = data.messages.map((msg: any) => ({
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
            const processedMessages = messageData.messages.map((msg: any) => ({
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
      outlet_type: outletType
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
  }, [outletType]);

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
        outlet_type: outletType,
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
  }, [outletType, isLoading, sendActionCableMessage]);

  // Try loading messages without ActionCable subscription
  const tryDirectMessageLoad = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot try direct message load: WebSocket not ready');
      return;
    }

    console.log('📤 Trying direct message load...');

    const directRequest = {
      action: 'request_my_messages',
      outlet_type: outletType,
      _function: 'loadUserMessages'
    };

    console.log('📤 Direct request:', directRequest);
    wsRef.current.send(JSON.stringify(directRequest));
  }, [outletType]);

  // Start WebSocket connection
  const startConnection = useCallback(() => {
    setIsConnecting(true);
    setConnectionError(null);
    messagesLoadedRef.current = false;

    console.log('🔐 Starting WebSocket connection...');

    try {
      const wsUrl = `wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authToken)}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🎉 WebSocket connection opened');
        
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
        console.log('💔 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        connectionAttemptedRef.current = false;
        messagesLoadedRef.current = false;
        
        if (subscriptionRef.current) {
          subscriptionRef.current.confirmed = false;
        }
        
        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && authToken && outletType && isActiveInstance) {
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
        console.error('❌ WebSocket error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
        setIsConnecting(false);
        connectionAttemptedRef.current = false;
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setConnectionError('Failed to create connection');
      setIsConnecting(false);
      connectionAttemptedRef.current = false;
    }
  }, [authToken, outletType, handleMessage, subscribeToChannel, isActiveInstance]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    console.log('🔐 Connect function called');
    
    if (!authToken || !outletType) {
      console.log('❌ Missing auth token or outlet type');
      setConnectionError('Missing auth token or outlet type');
      return;
    }

    if (!isActiveInstance) {
      console.log('⏭️ Skipping connection - not active instance');
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
  }, [authToken, outletType, isActiveInstance, startConnection, cleanup]);

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: string = 'text'): Promise<void> => {
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
    const optimisticMessage: Message = {
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
          outlet_type: outletType,
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
          outlet_type: outletType,
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
  }, [userData, outletType, sendActionCableMessage]);

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
      isActiveInstance,
      connectionAttempted: connectionAttemptedRef.current,
      messagesLoaded: messagesLoadedRef.current,
      hasAuthToken: !!authToken,
      hasOutletType: !!outletType,
      hasUserData: !!userData
    };
  }, [isActiveInstance, authToken, outletType, userData]);

  // Auto-connect
  useEffect(() => {
    if (!isActiveInstance) {
      console.log('⏭️ Skipping auto-connect - not active instance');
      return;
    }
    
    console.log('🔌 Auto-connect useEffect triggered');
    
    if (authToken && outletType && !autoConnectAttemptedRef.current && !isConnected && !isConnecting) {
      console.log('🚀 Auto-connecting to WebSocket...');
      autoConnectAttemptedRef.current = true;
      connect();
    }

    return () => {
      console.log('🧹 Auto-connect cleanup triggered');
    };
  }, [authToken, outletType, isActiveInstance, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - cleaning up WebSocket connection...');
      cleanup();
    };
  }, [cleanup]);

  // Combine messages for display
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

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
