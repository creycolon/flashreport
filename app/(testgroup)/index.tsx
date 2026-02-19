import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestGroupIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Group Index Screen</Text>
      <Text style={styles.text}>If you see this, group routing works</Text>
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