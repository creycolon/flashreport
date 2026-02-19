import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DemoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Demo Screen</Text>
      <Text style={styles.text}>Flat route test</Text>
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