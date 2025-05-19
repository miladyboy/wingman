import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, TextInput, Button } from 'react-native';
import useAuthSession from '../hooks/useAuthSession';
import useMessages from '../hooks/useMessages';
import { supabase } from '../services/supabaseClient';
import { createConversation, sendMessageToBackend } from '../services/messageService';

export default function ChatScreen({ route }) {
  const { id } = route.params;
  const { session } = useAuthSession();
  const { messages, fetchMessages, setMessages } = useMessages(supabase, session, id);
  const [text, setText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = useCallback(async () => {
    if (!text) return;

    let conversationId = id;
    if (conversationId === 'new') {
      const newConv = await createConversation(supabase, session.user.id, text.split(/\s+/).slice(0,5).join(' '));
      conversationId = newConv.id;
    }

    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('newMessageText', text);

    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
    await sendMessageToBackend(backendUrl, session.access_token, formData);
    setText('');
    fetchMessages();
  }, [text, id, session, fetchMessages]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => <Text style={{ padding: 8 }}>{item.content}</Text>}
      />
      <TextInput
        style={{ borderWidth: 1, margin: 8, padding: 8 }}
        value={text}
        onChangeText={setText}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}
