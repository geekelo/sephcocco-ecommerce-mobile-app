import { useCallback, useEffect, useRef, useState, useMemo } from "react";

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
    console.log('📝 Updated user data ref:', userData);
    console.log('📝 Updated current user ID ref:', userData?.id);
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

  // FIXED: Process new message - simplified and more reliable
  const processNewMessage = useCallback((messageData, source) => {
    console.log(`🚨 Processing new message from ${source}:`, messageData);

    if (!messageData || !messageData.content) {
      console.log('⚠️ Invalid message data, skipping:', messageData);
      return;
    }

    const currentTimestamp = messageData.created_at || messageData.timestamp || new Date().toISOString();
    const senderId = messageData.sender_id || messageData.user_id || messageData.user?.id;
    const isFromCurrentUser = userData && String(senderId) === String(userData.id);

    const newMessage = {
      id: messageData.id || `msg-${Date.now()}-${Math.random()}`,
      content: messageData.content,
      message_type: messageData.message_type || 'text',
      user_id: senderId || '',
      user_name: isFromCurrentUser ? 'You' : (messageData.user_name || messageData.user?.name || messageData.sender?.name || 'Support'),
      user_email: messageData.user_email || messageData.user?.email || messageData.sender?.email || '',
      user_role: messageData.user_role || messageData.user?.role || messageData.sender?.role || 'user',
      timestamp: currentTimestamp,
      created_at: currentTimestamp,
      display_time: formatDisplayTime(currentTimestamp),
      thread_id: messageData.thread_id,
      thread_status: messageData.thread_status
    };

    console.log('✅ Processed message:', newMessage);

    // Add message to state - avoid duplicates
    setMessages(prev => {
      // Check for duplicates by ID
      const existsById = prev.some(msg => msg.id === newMessage.id);
      if (existsById) {
        console.log('⚠️ Message with same ID exists, skipping');
        return prev;
      }

      // Check for duplicates by content and timestamp proximity (5 second window)
      const existsByContent = prev.some(msg => 
        msg.content === newMessage.content && 
        Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 5000
      );
      
      if (existsByContent) {
        console.log('⚠️ Similar message exists within 5 seconds, skipping');
        return prev;
      }
      
      console.log(`✅ Adding ${source} message to state`);
      const updatedMessages = [...prev, newMessage];
      console.log('📊 Total messages after adding:', updatedMessages.length);
      return updatedMessages;
    });

    // Remove matching optimistic message if it's from current user
    if (isFromCurrentUser) {
      console.log('🔄 Removing matching optimistic message');
      setOptimisticMessages(prev => 
        prev.filter(opt => opt.content !== newMessage.content)
      );
    }
  }, [userData]);

  // Process bulk messages from server response
  const processBulkMessages = useCallback((messagesArray, source) => {
    console.log(`📦 Processing bulk messages from ${source}:`, messagesArray?.length);
    
    if (!Array.isArray(messagesArray) || messagesArray.length === 0) {
      console.log('📦 No messages to process');
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const processedMessages = messagesArray
      .filter(msg => msg && msg.content) // Filter out invalid messages
      .map(msg => {
        const currentTimestamp = msg.created_at || msg.timestamp || new Date().toISOString();
        const senderId = msg.sender_id || msg.user_id || msg.user?.id;
        const isFromCurrentUser = userData && String(senderId) === String(userData.id);

        return {
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          content: msg.content,
          message_type: msg.message_type || 'text',
          user_id: senderId || '',
          user_name: isFromCurrentUser ? 'You' : (msg.user_name || msg.user?.name || 'Support'),
          user_email: msg.user_email || msg.user?.email || '',
          user_role: msg.user_role || msg.user?.role || 'user',
          timestamp: currentTimestamp,
          created_at: currentTimestamp,
          display_time: formatDisplayTime(currentTimestamp),
          thread_id: msg.thread_id,
          thread_status: msg.thread_status
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort by timestamp

    console.log('📦 Final processed bulk messages:', processedMessages.length);
    setMessages(processedMessages);
    setIsLoading(false);
  }, [userData]);

  // Separate function to handle channel subscription
  const subscribeToChannel = useCallback(() => {
    console.log('📡 subscribeToChannel called');
    console.log('📡 WebSocket state:', wsRef.current?.readyState);
    
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

  // Load user messages via WebSocket
  const loadUserMessages = useCallback(async () => {
    console.log('📤 loadUserMessages called');
    console.log('📤 Current user ID:', currentUserIdRef.current);
    console.log('📤 WebSocket state:', wsRef.current?.readyState);
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot load user messages: WebSocket not ready');
      return;
    }

    if (!currentUserIdRef.current) {
      console.error('❌ Cannot load user messages: No user ID available');
      return;
    }

    setIsLoading(true);

    try {
      // Try ActionCable format first
      if (subscriptionRef.current?.confirmed) {
        console.log('📤 Loading via ActionCable...');
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
      
      // Set a timeout to handle no response
      setTimeout(() => {
        console.log('⏰ Loading timeout reached');
        setIsLoading(false);
      }, 10000);
      
    } catch (error) {
      console.error('Error loading user messages via WebSocket:', error);
      setIsLoading(false);
    }
  }, [sendActionCableMessage]);

  // Try loading messages without ActionCable subscription
  const tryDirectMessageLoad = useCallback(() => {
    console.log('📤 tryDirectMessageLoad called');
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot try direct message load: WebSocket not ready');
      return;
    }

    const directRequest = {
      action: 'request_my_messages',
      outlet_type: outletTypeRef.current,
      user_id: currentUserIdRef.current,
      _function: 'loadUserMessages'
    };

    console.log('📤 Direct request:', directRequest);
    wsRef.current.send(JSON.stringify(directRequest));
  }, []);

  // FIXED: Handle WebSocket messages - better message parsing
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Raw WebSocket message received:', data);
      console.log('📨 Message type:', data.type);

      // Handle ping messages
      if (data.type === 'ping') {
        console.log('🏓 Ping received, responding with pong');
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'pong', message: data.message }));
        }
        return;
      }

      // Handle pong response
      if (data.type === 'pong') {
        console.log('🏓 Pong response received');
        return;
      }

      // Handle ActionCable welcome
      if (data.type === 'welcome') {
        console.log('🎉 ActionCable welcome received');
        setTimeout(subscribeToChannel, 500);
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
          
          // Load messages after subscription confirmation
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
        setConnectionError('Subscription rejected');
        setIsConnected(false);
        setIsConnecting(false);
        return;
      }

      // FIXED: Handle direct message responses - multiple formats
      if (data.type === 'user_messages_response' || data.messages || data.data) {
        console.log('📨 Direct user messages response received:', data);
        
        // Handle multiple possible message formats
        let receivedMessages = [];
        
        // Try different data structures
        if (Array.isArray(data.messages)) {
          receivedMessages = data.messages;
        } else if (Array.isArray(data.data?.messages)) {
          receivedMessages = data.data.messages;
        } else if (Array.isArray(data.data)) {
          receivedMessages = data.data;
        } else if (data.type === 'user_messages_response' && data.data) {
          // Handle the specific format from your logs
          receivedMessages = Array.isArray(data.data) ? data.data : [];
        }
        
        console.log('📨 Extracted messages array:', receivedMessages);
        processBulkMessages(receivedMessages, 'direct');
        return;
      }

      // FIXED: Handle real-time individual messages - look for any message-like data
      const isRealTimeMessage = 
        data.type === 'new_message' || 
        data.type === 'broadcast_message' || 
        data.type === 'message_broadcast' || 
        data.type === 'message_updated' ||
        data.type === 'chat_message' ||
        data.broadcast === true ||
        (data.message && data.message.content) ||
        (data.content && data.user_id); // Direct message format

      if (isRealTimeMessage) {
        console.log('🚨 REAL-TIME: Direct message received!');
        const messageToProcess = data.message || data;
        processNewMessage(messageToProcess, 'real-time-direct');
        return;
      }

      // Handle ActionCable wrapped messages
      if (data.identifier && data.message) {
        let messageData;
        try {
          messageData = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
        } catch (e) {
          messageData = data.message;
        }

        console.log('📨 ActionCable message data:', messageData);

        // Handle user messages response via ActionCable
        if (messageData.type === 'user_messages_response' || messageData.messages || messageData.data) {
          console.log('📨 User messages response via ActionCable:', messageData);
          
          let receivedMessages = [];
          if (Array.isArray(messageData.messages)) {
            receivedMessages = messageData.messages;
          } else if (Array.isArray(messageData.data?.messages)) {
            receivedMessages = messageData.data.messages;
          } else if (Array.isArray(messageData.data)) {
            receivedMessages = messageData.data;
          }
          
          console.log('📨 ActionCable extracted messages:', receivedMessages);
          processBulkMessages(receivedMessages, 'ActionCable');
          return;
        }

        // Handle real-time messages via ActionCable
        const isActionCableRealTime = 
          messageData.type === 'new_message' || 
          messageData.type === 'broadcast_message' || 
          messageData.type === 'message_broadcast' || 
          messageData.type === 'message_updated' ||
          messageData.type === 'chat_message' ||
          messageData.broadcast === true ||
          (messageData.message && messageData.message.content) ||
          (messageData.content && messageData.user_id);

        if (isActionCableRealTime) {
          console.log('🚨 REAL-TIME: ActionCable message received!');
          const messageToProcess = messageData.message || messageData;
          processNewMessage(messageToProcess, 'real-time-ActionCable');
          return;
        }

        // Handle ping/pong via ActionCable
        if (messageData.type === 'ping') {
          console.log('🏓 ActionCable ping received');
          sendActionCableMessage('pong', { message: messageData.message });
          return;
        }

        if (messageData.error) {
          console.error('❌ WebSocket error received:', messageData.error);
          setConnectionError(messageData.error);
          return;
        }
      }

      // FALLBACK: Try to find any message-like data in the response
      console.log('🔍 No specific handler matched, searching for message data...');
      if (data.content || (data.data && typeof data.data === 'object')) {
        console.log('🔍 Found potential message data, attempting to process...');
        processNewMessage(data, 'fallback');
      }

    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      console.error('❌ Raw message data:', event.data);
    }
  }, [processNewMessage, processBulkMessages, sendActionCableMessage, subscribeToChannel, loadUserMessages]);

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

  // Send message function
  const sendMessage = useCallback(async (content, messageType = 'text', productId = null) => {
    console.log('📤 SEND_MESSAGE called with content:', content);
    
    if (!content || content.trim() === '') {
      console.error('Cannot send empty message');
      throw new Error('Message content cannot be empty');
    }

    if (!currentUserIdRef.current) {
      console.error('❌ Cannot send message: No user ID available');
      throw new Error('User ID not available');
    }

    // Check connection but allow sending even if not fully confirmed
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    const user = userDataRef.current || getActiveUser();
    const messageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    console.log('📤 User sending message:', content);
    console.log('📤 Current user:', user);
    
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

    // Add optimistic message immediately
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
        timestamp: timestamp,
        outlet_type: outletTypeRef.current
      };

      // Always try both formats to ensure delivery
      let messageSent = false;

      // Try ActionCable format first
      if (subscriptionRef.current?.confirmed) {
        console.log('📤 Sending via ActionCable...');
        const success = sendActionCableMessage('receive', {
          message: messagePayload,
          outlet_type: outletTypeRef.current,
          product_id: productId,
          _function: 'sendMessage'
        });
        messageSent = success;
      }

      // Also try direct format as fallback or primary method
      if (!messageSent || !subscriptionRef.current?.confirmed) {
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
        messageSent = true;
      }

      if (!messageSent) {
        throw new Error('Failed to send message via any method');
      }

      console.log('✅ Message sent successfully');

      // Clean up optimistic message after timeout
      setTimeout(() => {
        setOptimisticMessages(prev => {
          const stillExists = prev.find(msg => msg.id === messageId);
          if (stillExists) {
            console.log('⏰ Optimistic message timeout - checking for real message');
            
            // Check if a real message with same content exists
            const realMessageExists = messages.some(msg => 
              msg.content === stillExists.content && 
              Math.abs(new Date(msg.timestamp).getTime() - new Date(stillExists.timestamp).getTime()) < 15000
            );

            if (!realMessageExists) {
              console.log('⏰ Converting optimistic to permanent message');
              setMessages(current => {
                const alreadyExists = current.find(msg => 
                  msg.content === stillExists.content && 
                  Math.abs(new Date(msg.timestamp).getTime() - new Date(stillExists.timestamp).getTime()) < 15000
                );
                if (!alreadyExists) {
                  const permanentMessage = { ...stillExists, optimistic: false };
                  return [...current, permanentMessage];
                }
                return current;
              });
            }
            
            return prev.filter(msg => msg.id !== messageId);
          }
          return prev;
        });
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error sending message via WebSocket:', error);
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== messageId));
      throw error;
    }
  }, [sendActionCableMessage, messages]);

  // Auto-load messages when connection becomes active
  useEffect(() => {
    if (isConnected && wsRef.current && currentUserIdRef.current && !messagesLoadedRef.current) {
      console.log('🔄 Connection is active, loading messages...');
      messagesLoadedRef.current = true;
      
      setTimeout(() => {
        loadUserMessages();
      }, 2000);
    }
  }, [isConnected, loadUserMessages]);

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
  }, [authToken, outletType, connect, cleanup]);

  // FIXED: Combine messages for display - better deduplication and sorting
  const allMessages = useMemo(() => {
    console.log('🔄 Computing allMessages...');
    console.log('📊 Messages count:', messages.length);
    console.log('📊 Optimistic messages count:', optimisticMessages.length);
    
    const combined = [...messages, ...optimisticMessages];
    
    // Remove duplicates by ID first, then by content and timestamp proximity
    const uniqueMessages = combined.filter((message, index, array) => {
      // Check for duplicate IDs
      const duplicateById = array.findIndex(other => other.id === message.id);
      if (duplicateById !== index) {
        console.log('🔍 Removing duplicate by ID:', message.id);
        return false;
      }
      
      // Check for duplicate content within 5 seconds
      const duplicateByContent = array.findIndex(other => 
        other !== message &&
        other.content === message.content &&
        Math.abs(new Date(other.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
      );
      
      if (duplicateByContent !== -1 && duplicateByContent < index) {
        console.log('🔍 Removing duplicate by content:', message.content);
        return false;
      }
      
      return true;
    });
    
    // Sort by timestamp
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    console.log('📊 Final allMessages count:', sortedMessages.length);
    console.log('📊 Final allMessages:', sortedMessages);
    
    return sortedMessages;
  }, [messages, optimisticMessages]);

  // Debug function to check state
  const debugState = useCallback(() => {
    console.log('🔍 DEBUG STATE:');
    console.log('🔍 messages.length:', messages.length);
    console.log('🔍 messages:', messages);
    console.log('🔍 optimisticMessages.length:', optimisticMessages.length);
    console.log('🔍 optimisticMessages:', optimisticMessages);
    console.log('🔍 allMessages.length:', allMessages.length);
    console.log('🔍 allMessages:', allMessages);
    console.log('🔍 isLoading:', isLoading);
    console.log('🔍 isConnected:', isConnected);
    console.log('🔍 WebSocket state:', wsRef.current?.readyState);
    console.log('🔍 Subscription confirmed:', subscriptionRef.current?.confirmed);
  }, [messages, optimisticMessages, allMessages, isLoading, isConnected]);

  // Public functions
  const refreshMessages = useCallback(async () => {
    console.log('🔄 Refreshing messages...');
    setIsLoading(true);
    messagesLoadedRef.current = false;
    setMessages([]); // Clear existing messages
    setOptimisticMessages([]); // Also clear optimistic messages
    
    // Add a small delay to ensure state is cleared
    setTimeout(() => {
      loadUserMessages();
    }, 100);
  }, [loadUserMessages]);

  const clearOptimisticMessages = useCallback(() => {
    console.log('🧹 Clearing optimistic messages');
    setOptimisticMessages([]);
  }, []);

  const triggerMessageLoad = useCallback(() => {
    console.log('🔄 Manually triggering message load...');
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (subscriptionRef.current?.confirmed) {
        sendActionCableMessage('request_my_messages', {
          outlet_type: outletTypeRef.current,
          user_id: currentUserIdRef.current,
          _function: 'manualLoad'
        });
      } else {
        const requestData = {
          action: 'request_my_messages',
          outlet_type: outletTypeRef.current,
          user_id: currentUserIdRef.current,
          _function: 'manualLoad'
        };
        
        wsRef.current.send(JSON.stringify(requestData));
      }
    }
  }, [sendActionCableMessage]);

  // Force add test message for debugging
  const addTestMessage = useCallback(() => {
    console.log('🧪 Adding test message');
    const testMessage = {
      id: `test-${Date.now()}`,
      content: "This is a test message added locally",
      message_type: "text",
      user_id: "test-user",
      user_name: "Test User",
      user_email: "test@example.com",
      user_role: "user",
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      display_time: formatDisplayTime(new Date().toISOString())
    };
    
    setMessages(prev => [...prev, testMessage]);
  }, []);

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
    connect, // Expose connect function for manual connection
    cleanup, // Expose cleanup function for manual cleanup
    debugState, // Expose debug function
    addTestMessage // Expose test message function for debugging
  };
};