import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sign In" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
