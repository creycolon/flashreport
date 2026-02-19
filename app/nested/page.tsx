import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NestedPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nested Page Screen</Text>
      <Text style={styles.text}>Path: /nested/page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    marginBottom: 10,
  },
});