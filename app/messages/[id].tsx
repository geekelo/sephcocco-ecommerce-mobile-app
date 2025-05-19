import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import React from 'react';
import MobileChatDetail from '@/components/message/chatDetail';
import { Layout } from '@/components/layout/Layout';
import { messages } from '@/components/message/message';

const MessageDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const chatItem = messages.find((item) => item.id === id);

  return (
    <Layout>
      <MobileChatDetail chatItem={chatItem} onBackClick={() => router.back()} />
    </Layout>
  );
};

export default MessageDetail;
