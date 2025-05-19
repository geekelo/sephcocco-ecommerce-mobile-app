import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MessageCard from '@/components/message/messageCard';
import FAQItem from '@/components/message/faqItem';
import { Layout } from '@/components/layout/Layout';


import {  useNavigation } from "expo-router";
const sampleMessages = [
    {
    id: '1',
    title: 'Listerine Zero Delivery Enquiry',
    subtitle: 'Hello I made payment for the list...',
  },
  {
    id: '2',
    title: 'Order Delay Follow-up',
    subtitle: 'Any updates on the dispatch?',
  },
  {
    id: '3',
    title: 'Refund Request',
    subtitle: 'I haven’t received my refund yet...',
  },
];

const sampleFAQs = [
  { id: '1', question: 'How to track my order?', answer: 'Go to orders and click track.' },
  { id: '2', question: 'How to request a refund?', answer: 'Go to support and file a request.' },
];

export default function MessageScreen() {
   const navigations = useNavigation();
  
  const handleBack = () => navigations.goBack();
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const router = useRouter();

  return (
    <Layout>
    <View style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity  onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
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
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
  <TouchableOpacity style={styles.supportButton}>
  <View style={styles.chatWithSupport}>
    <Feather name="message-circle" size={18} color="#10b981" />
    <Text style={styles.supportText}>Chat with Support now</Text>
  </View>
</TouchableOpacity>

<FlatList
  contentContainerStyle={styles.chatList}
  data={sampleMessages}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <MessageCard
      title={item.title}
      subtitle={item.subtitle}
      onPress={() =>
        router.push({
          pathname: '/messages/[id]',
          params: { id: item.id },
        })
      }
    />
  )}
/>

        </>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <FlatList
          data={sampleFAQs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FAQItem question={item.question} answer={item.answer} />
          )}
        />
      )}
    </View>
    </Layout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  activeTabText: {
    color: '#10b981',
    fontWeight: 'bold',
  },

  supportButton: {
    padding: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    
  },
  chatWithSupport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    gap: 8,
  },
  supportText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginLeft: 8,
  },

  chatList: {
    flex: 1,
  },
});
