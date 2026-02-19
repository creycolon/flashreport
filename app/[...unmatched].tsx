import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function UnmatchedRoute() {
  const params = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ruta no encontrada</Text>
      <Text style={styles.text}>Path: {JSON.stringify(params.unmatched)}</Text>
      <Text style={styles.text}>Esta es una pantalla personalizada para rutas no encontradas</Text>
      <Text style={styles.text}>Si ves esto, Expo Router funciona pero la ruta no existe</Text>
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
    color: '#ff1744',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
});