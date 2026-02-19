import { Slot } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestGroupLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Test Group Header</Text>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    color: '#ff00ff',
    fontSize: 18,
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#333',
  },
});