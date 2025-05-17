import React, { useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Button } from 'react-native';
import useConversations from '../hooks/useConversations';
import useAuthSession from '../hooks/useAuthSession';
import { supabase } from '../services/supabaseClient';

export default function ChatListScreen({ navigation }) {
  const { session } = useAuthSession();
  const { conversations, fetchConversations } = useConversations(supabase, session);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Chat', { id: item.id })}>
      <Text style={{ padding: 16 }}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <Button title="New Chat" onPress={() => navigation.navigate('Chat', { id: 'new' })} />
    </View>
  );
}
