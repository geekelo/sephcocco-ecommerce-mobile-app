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

export const useMessaging = (
  authToken: string, 
  outletType: string = '', 
  userData?: User
): MessagingHookReturn => {
  console.log('🚀 useMessaging hook initialized');
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  
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
        minute: '2-digit'
      });
    } catch (error) {
      return new Date().toLocaleString();
    }
  };

  // Clean up connection
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('📨 Received:', data.type, data);

      switch (data.type) {
        case 'user_messages_response':
          if (data.messages) {
            const processedMessages = data.messages.map(msg => ({
              ...msg,
              display_time: formatDisplayTime(msg.timestamp || msg.created_at)
            }));
            setMessages(processedMessages);
            console.log('✅ Loaded messages:', processedMessages.length);
          }
          setIsLoading(false);
          break;

        case 'new_message':
        case 'broadcast_message':
          if (data.content) {
            const newMessage: Message = {
              id: data.id || `msg-${Date.now()}`,
              content: data.content,
              message_type: data.message_type || 'text',
              user_id: data.user_id || data.sender?.id || '',
              user_name: data.user_name || data.sender?.name || data.user?.name || 'Support',
              user_email: data.user_email || data.sender?.email || data.user?.email || '',
              user_role: data.user_role || data.sender?.role || data.user?.role || 'support',
              timestamp: data.timestamp || data.created_at || new Date().toISOString(),
              created_at: data.created_at || data.timestamp || new Date().toISOString(),
              display_time: formatDisplayTime(data.timestamp || data.created_at || new Date().toISOString())
            };

            // Remove matching optimistic message if it's from current user
            if (userData && newMessage.user_id === userData.id) {
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
              
              if (exists) return prev;
              return [...prev, newMessage];
            });
          }
          break;

        case 'error':
          console.error('❌ WebSocket error:', data.error);
          setConnectionError(data.error || 'Unknown error');
          break;

        default:
          console.log('❓ Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  }, [userData]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!authToken || !outletType) {
      setConnectionError('Missing auth token or outlet type');
      return;
    }

    if (wsRef.current) {
      cleanup();
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const wsUrl = `wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authToken)}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🎉 Connected to WebSocket');
        
        // Subscribe to messaging channel
        const subscribeMessage = {
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: 'MessagingChannel',
            outlet_type: outletType
          })
        };
        
        wsRef.current?.send(JSON.stringify(subscribeMessage));
        
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        
        // Load messages after connection
        setTimeout(() => {
          loadMessages();
        }, 1000);
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('💔 WebSocket closed:', event.code);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && authToken) {
          console.log('🔄 Reconnecting in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setConnectionError('Failed to create connection');
      setIsConnecting(false);
    }
  }, [authToken, outletType, handleMessage, cleanup]);

  // Load messages
  const loadMessages = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot load messages: WebSocket not ready');
      return;
    }

    console.log('📤 Loading messages...');
    setIsLoading(true);

    const requestData = {
      action: 'request_my_messages',
      outlet_type: outletType,
      _function: 'loadUserMessages'
    };

    wsRef.current.send(JSON.stringify(requestData));
    
    // Timeout if no response
    setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        console.log('⏰ Load messages timeout');
      }
    }, 10000);
  }, [outletType, isLoading]);

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: string = 'text'): Promise<void> => {
    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (!wsRef.current || !isConnected) {
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
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      const messageData = {
        action: 'receive',
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
      };

      wsRef.current.send(JSON.stringify(messageData));
      console.log('✅ Message sent');

      // Remove optimistic message after timeout if not confirmed
      setTimeout(() => {
        setOptimisticMessages(prev => {
          const stillExists = prev.find(msg => msg.id === messageId);
          if (stillExists) {
            // Convert to permanent message
            setMessages(current => [...current, { ...stillExists, optimistic: false }]);
          }
          return prev.filter(msg => msg.id !== messageId);
        });
      }, 5000);

    } catch (error) {
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== messageId));
      throw error;
    }
  }, [isConnected, userData, outletType]);

  // Public functions
  const refreshMessages = useCallback(async () => {
    loadMessages();
  }, [loadMessages]);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  const triggerMessageLoad = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-connect
  useEffect(() => {
    if (authToken && outletType) {
      connect();
    }

    return cleanup;
  }, [authToken, outletType, connect, cleanup]);

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