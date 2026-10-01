/**
 * App Navigation Configuration
 * Manages transitions between Dashboard, Resume Setup, Live Interview HUD, Summary, and Coaching Drills
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgentCoachingScreen } from '../screens/AgentCoachingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ResumeSetupScreen } from '../screens/ResumeSetupScreen';
import { InterviewSessionScreen } from '../screens/InterviewSessionScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { MistakeDrillScreen } from '../screens/MistakeDrillScreen';
import { ModelManagerScreen } from '../screens/ModelManagerScreen';
import { VoiceEnrollmentScreen } from '../screens/VoiceEnrollmentScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AgentCoaching"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="AgentCoaching" component={AgentCoachingScreen as any} />
        <Stack.Screen name="VoiceEnrollment" component={VoiceEnrollmentScreen as any} />
        <Stack.Screen name="Dashboard" component={DashboardScreen as any} />
        <Stack.Screen name="ResumeSetup" component={ResumeSetupScreen as any} />
        <Stack.Screen name="InterviewSession" component={InterviewSessionScreen as any} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen as any} />
        <Stack.Screen name="MistakeDrill" component={MistakeDrillScreen as any} />
        <Stack.Screen name="ModelManager" component={ModelManagerScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

