import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestScreen() {
  return (
    <View style={styles.container} testID="test-screen">
      <Text style={styles.title}>Test Screen</Text>
      <Text style={styles.text}>If you see this, routing works</Text>
      <Text style={styles.text}>This screen doesn't use any providers or complex layouts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38ff14',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
});