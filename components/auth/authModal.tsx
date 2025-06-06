// components/modals/AuthModal.tsx
import React from 'react';
import { Modal,  StyleSheet,  TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

type AuthModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
};

const AuthModal = ({ visible, title, description, children, onClose }: AuthModalProps) => {
    const colorScheme = useColorScheme();
      const theme = Colors[colorScheme ?? 'light'];
    
  return (
    <Modal transparent visible={visible} animationType="slide">
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ThemedText type='title' >{title}</ThemedText>
          {description && <ThemedText type='defaultSemiBold' >{description}</ThemedText>}
          <ThemedView style={styles.content}>{children}</ThemedView>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.closeText}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

export default AuthModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    gap: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  description: {
    fontSize: 26,
    color: Colors.dark.text,
    marginBottom: 10,
  },
  content: {
    marginVertical: 10,
  },
  closeText: {
    color: Colors.dark.tint,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
