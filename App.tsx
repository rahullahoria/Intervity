/**
 * Offline AI Mock Interview Application
 * 100% on-device AI voice interview practice powered by Whisper Turbo, MiniCPM5-2B, Kokoro-82M & op-sqlite
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, LogBox, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SQLiteClient } from './src/database/SQLiteClient';
import { colors } from './src/theme/colors';

LogBox.ignoreAllLogs(true);

export default function App() {
  useEffect(() => {
    // Request microphone permission on Android
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
        title: 'Microphone Permission',
        message: 'Offline AI Interview requires microphone access to conduct mock interviews.',
        buttonPositive: 'Allow',
      }).catch((err) => {
        console.warn('[App] Microphone permission error:', err);
      });
    }

    // Initialize SQLite persistence on app launch
    SQLiteClient.getInstance().initialize().catch((err) => {
      console.warn('[App] SQLite initialization warning:', err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
