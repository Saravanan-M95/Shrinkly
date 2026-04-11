import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgPrimary },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="compress" />
      <Stack.Screen name="resize" />
      <Stack.Screen name="crop" />
      <Stack.Screen name="rotate" />
      <Stack.Screen name="convert-to-jpg" />
      <Stack.Screen name="convert-from-jpg" />
      <Stack.Screen name="watermark" />
      <Stack.Screen name="meme-generator" />
      <Stack.Screen name="photo-editor" />
      <Stack.Screen name="blur-face" />
      <Stack.Screen name="html-to-image" />
      <Stack.Screen name="remove-background" />
      <Stack.Screen name="upscale" />
    </Stack>
  );
}
