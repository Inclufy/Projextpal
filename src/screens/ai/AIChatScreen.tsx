import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const AIChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hallo! Ik ben je AI assistent. Hoe kan ik je helpen met je projecten?', isUser: false, timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState('');

  const quickActions = [
    { icon: 'document-text', text: 'Genereer rapport', color: '#8B5CF6' },
    { icon: 'analytics', text: 'Analyseer data', color: '#3B82F6' },
    { icon: 'bulb', text: 'Suggesties', color: '#F59E0B' },
    { icon: 'calendar', text: 'Plan taak', color: '#10B981' },
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Ik heb je vraag ontvangen en werk aan een antwoord. Deze functie is binnenkort volledig beschikbaar!',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>AI Assistent</Text>
          <Text style={styles.subtitle}>Powered by Claude</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}
          >
            {!message.isUser && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="white" />
              </View>
            )}
            <View style={[styles.messageContent, message.isUser ? styles.userContent : styles.aiContent]}>
              <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
                {message.text}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Snelle acties</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickAction}>
                <LinearGradient colors={[action.color, action.color + 'DD']} style={styles.quickActionGradient}>
                  <Ionicons name={action.icon as any} size={20} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Stel een vraag..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
          maxLength={500}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.sendButtonGradient}>
            <Ionicons name="send" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 8 },
  headerInfo: { flex: 1, marginLeft: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  menuButton: { padding: 8 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20 },
  messageBubble: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageContent: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  userContent: { backgroundColor: '#8B5CF6' },
  aiContent: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  userText: { color: 'white' },
  aiText: { color: '#1F2937' },
  timestamp: { fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
  quickActionsContainer: { marginTop: 20 },
  quickActionsTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAction: { alignItems: 'center', width: '22%' },
  quickActionGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickActionText: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, marginRight: 8 },
  sendButton: { borderRadius: 24, overflow: 'hidden' },
  sendButtonGradient: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
});
