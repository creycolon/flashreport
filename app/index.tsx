import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  // Redirect to login - AuthGuard will handle the rest
  return <Redirect href="/login" />;
}