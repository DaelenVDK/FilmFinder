import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tabs = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  useEffect(() => {
    console.log('[HomeStackNavigator] mount');
    return () => console.log('[HomeStackNavigator] unmount');
  }, []);
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: 'FilmFinder' }}
      />
      <HomeStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({ title: route.params?.title || 'Details' })}
      />
    </HomeStack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    console.log('[App] mount');
    return () => console.log('[App] unmount');
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tabs.Navigator screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="Home" component={HomeStackNavigator} />
        <Tabs.Screen name="Profile" component={ProfileScreen} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
