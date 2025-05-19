import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    if (!email) return;
    await supabase.auth.signInWithOtp({ email });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Send Magic Link" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, padding: 8, marginBottom: 12 }
});
