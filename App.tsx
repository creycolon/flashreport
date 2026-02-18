import { ExpoRoot } from 'expo-router';

// This entry point is required for expo-router to handle navigation properly
export default function App() {
  console.error('🟪 APP.TSX: Main App component rendering');
  // @ts-ignore: require.context is webpack-specific but used by Expo Router
  const ctx = require.context('./app');
  console.error('🟪 APP.TSX: Context loaded, returning ExpoRoot');
  return <ExpoRoot context={ctx} />;
}
