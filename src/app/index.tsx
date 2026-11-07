import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Splash } from '../screens/Splash';

export default function Index() {
  const done = useCallback(() => router.replace('/welcome'), []);
  return <Splash onDone={done} />;
}
