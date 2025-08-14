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
}

// ActionCable subscription management
interface ActionCableSubscription {
  identifier: string;
  confirmed: boolean;
}

export const useMessaging = (
  authToken: string, 
  outletType: string = '', 
  userData?: User
): MessagingHookReturn => {
  console.log('🚀 useMessaging (TypeScript) hook initialized');
  console.log('🔑 Auth token:', !!authToken);
  console.log('🏪 Outlet type:', outletType);
  console.log('👤 User data:', userData);
  
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

  // Send message via ActionCable protocol (like web version)
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

  // Handle WebSocket messages (ActionCable protocol)
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('📨 Raw WebSocket message received:', data);

      // Handle ActionCable welcome message
      if (data.type === 'welcome') {
        console.log('🎉 ActionCable welcome received');
        return;
      }

      // Handle subscription confirmation
      if (data.type === 'confirm_subscription') {
        console.log('✅ Subscription confirmed:', data.identifier);
        if (subscriptionRef.current) {
          subscriptionRef.current.confirmed = true;
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionError(null);
          
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

      // Handle ActionCable data messages
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
            console.log('✅ Loaded messages:', processedMessages.length);
          }
          setIsLoading(false);
          return;
        }

        // Handle real-time new messages
        if (messageData.type === 'new_message' || 
            messageData.type === 'broadcast_message' || 
            messageData.type === 'message_broadcast' || 
            messageData.type === 'message_updated' ||
            messageData.type === 'chat_message' ||
            messageData.broadcast === true) {
          
          console.log('🚨 REAL-TIME: New message received!', messageData);

          if (messageData.content) {
            const currentTimestamp = messageData.created_at || messageData.timestamp || new Date().toISOString();
            const senderId = messageData.sender_id || messageData.user?.id || messageData.user_id;
            const threadOwnerId = messageData.thread_owner_id || messageData.user_id || senderId;
            const isFromCurrentUser = userData && String(senderId) === String(userData.id);

            const newMessage: Message = {
              id: messageData.id || `msg-${Date.now()}`,
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
                
                console.log('✅ Adding real-time message');
                return [...prev, newMessage];
              });
            } else {
              console.log('⚠️ Message not for current user, ignoring');
            }
          }
          return;
        }

        // Handle ping/pong
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
  }, [userData, sendActionCableMessage]);

  // Connect to WebSocket with ActionCable protocol
  const connect = useCallback(() => {
    if (!authToken || !outletType) {
      setConnectionError('Missing auth token or outlet type');
      return;
    }

    if (connectionAttemptedRef.current || isConnecting || isConnected) {
      console.log('🔐 Connection already attempted or in progress, skipping...');
      return;
    }

    if (wsRef.current) {
      cleanup();
    }

    connectionAttemptedRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);
    messagesLoadedRef.current = false;

    console.log('🔐 Attempting to connect...');

    try {
      const wsUrl = `wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authToken)}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🎉 WebSocket connection opened');
        
        // Subscribe to messaging channel using ActionCable protocol
        const identifier = JSON.stringify({
          channel: 'MessagingChannel',
          outlet_type: outletType
        });
        
        const subscribeMessage = {
          command: 'subscribe',
          identifier: identifier
        };
        
        console.log('📡 Subscribing to channel:', subscribeMessage);
        wsRef.current?.send(JSON.stringify(subscribeMessage));
        
        // Store subscription info
        subscriptionRef.current = {
          identifier: identifier,
          confirmed: false
        };
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
        if (event.code !== 1000 && authToken && outletType) {
          console.log('🔄 Reconnecting in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnected && !isConnecting) {
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
  }, [authToken, outletType, handleMessage, cleanup, isConnected, isConnecting]);

  // Load messages (like web version)
  const loadMessages = useCallback(() => {
    if (!subscriptionRef.current?.confirmed) {
      console.log('❌ Cannot load messages: Subscription not confirmed');
      return;
    }

    console.log('📤 Loading user messages...');
    setIsLoading(true);

    const success = sendActionCableMessage('request_my_messages', {
      outlet_type: outletType,
      _function: 'loadUserMessages'
    });

    if (!success) {
      setIsLoading(false);
      return;
    }
    
    // Timeout if no response
    setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        console.log('⏰ Load messages timeout');
      }
    }, 10000);
  }, [outletType, isLoading, sendActionCableMessage]);

  // Send message (like web version)
  const sendMessage = useCallback(async (content: string, messageType: string = 'text'): Promise<void> => {
    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (!subscriptionRef.current?.confirmed) {
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

    // Add optimistic message
    console.log('📤 Adding optimistic message:', optimisticMessage);
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send message using ActionCable protocol (like web version)
      const success = sendActionCableMessage('receive', {
        message: {
          content: content,
          message_type: messageType,
          user_id: userData.id,
          user_name: userData.name,
          user_email: userData.email,
          user_role: userData.role,
          timestamp: timestamp
        },
        outlet_type: outletType,
        _function: 'sendMessage'
      });

      if (!success) {
        throw new Error('Failed to send message');
      }

      console.log('✅ Message sent successfully');

      // Remove optimistic message after timeout if not confirmed
      setTimeout(() => {
        setOptimisticMessages(prev => {
          const stillExists = prev.find(msg => msg.id === messageId);
          if (stillExists) {
            console.log('⏰ Converting optimistic message to permanent');
            // Convert to permanent message
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
      // Remove optimistic message on error
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

  // Auto-connect
  useEffect(() => {
    console.log('🔌 Auto-connect useEffect triggered');
    
    if (authToken && outletType && !autoConnectAttemptedRef.current && !isConnected && !isConnecting) {
      console.log('🚀 Auto-connecting to WebSocket...');
      autoConnectAttemptedRef.current = true;
      connect();
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      cleanup();
      autoConnectAttemptedRef.current = false;
    };
  }, [authToken, outletType, connect, cleanup, isConnected, isConnecting]);

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
    triggerMessageLoad
  };
};
