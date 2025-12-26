import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';

import ReportIssueScreen from '../screens/ReportIssueScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';

          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'MyReports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Emergency') {
            iconName = focused ? 'call' : 'call-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.lightGray,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Street Eye',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Report"
        component={ReportIssueScreen}
        options={{ title: 'Report Issue' }}
      />
      <Tab.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{ title: 'My Reports' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ title: 'Emergency' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="IssueDetail"
              component={IssueDetailScreen}
              options={{
                headerShown: true,
                title: 'Issue Details',
                headerStyle: {
                  backgroundColor: colors.white,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.lightGray,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

