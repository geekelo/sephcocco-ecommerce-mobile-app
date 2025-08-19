// Add this debug component to your main messaging screen for testing

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const DebugPanel = ({ messages, optimisticMessages, allMessages, userData, isConnected, isLoading }) => {
  return (
    <ScrollView style={styles.debugContainer} horizontal>
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Info</Text>
        
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>Connected:</Text>
          <Text style={[styles.debugValue, { color: isConnected ? '#10b981' : '#ef4444' }]}>
            {isConnected ? 'Yes' : 'No'}
          </Text>
        </View>
        
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>Loading:</Text>
          <Text style={styles.debugValue}>{isLoading ? 'Yes' : 'No'}</Text>
        </View>
        
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>User ID:</Text>
          <Text style={styles.debugValue}>{userData?.id || 'None'}</Text>
        </View>
        
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>Messages:</Text>
          <Text style={styles.debugValue}>{messages?.length || 0}</Text>
        </View>
        
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>Optimistic:</Text>
          <Text style={styles.debugValue}>{optimisticMessages?.length || 0}</Text>
        </View>
        
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>All Messages:</Text>
          <Text style={styles.debugValue}>{allMessages?.length || 0}</Text>
        </View>
      </View>
      
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Raw Messages</Text>
        {messages?.slice(0, 3).map((msg, index) => (
          <View key={index} style={styles.messageDebug}>
            <Text style={styles.debugSmall}>ID: {msg.id}</Text>
            <Text style={styles.debugSmall}>Content: {msg.content}</Text>
            <Text style={styles.debugSmall}>User: {msg.user_name}</Text>
            <Text style={styles.debugSmall}>UserID: {msg.user_id}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    backgroundColor: '#1f2937',
    maxHeight: 200,
    padding: 10,
  },
  debugSection: {
    marginRight: 20,
    minWidth: 200,
  },
  debugTitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  debugLabel: {
    color: '#9ca3af',
    fontSize: 12,
    minWidth: 80,
  },
  debugValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  messageDebug: {
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  debugSmall: {
    color: '#d1d5db',
    fontSize: 10,
  },
});

export default DebugPanel;

// TO USE THIS:
// 1. Import it in your main component
// 2. Add this line where you want the debug panel (maybe after the debug info section):

/*
<DebugPanel 
  messages={messages}
  optimisticMessages={optimisticMessages}
  allMessages={allMessages}
  userData={userData}
  isConnected={isConnected}
  isLoading={isLoading}
/>
*/