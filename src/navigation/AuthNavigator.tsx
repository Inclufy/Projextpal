import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

const Stack = createStackNavigator();

// Login-only: accounts are created by organizations outside the app
// (App Review Guidelines 3.1.1 / 3.1.3(c)) — no in-app registration.
export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
