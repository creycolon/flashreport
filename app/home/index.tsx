import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Index Screen</Text>
      <Text style={styles.text}>Nested route test</Text>
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