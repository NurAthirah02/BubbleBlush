//app/stacks/profileStack.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../(tabs)/profile';
import PurchaseHistory from '../screens/purchaseHistory';
import Wishlist from '../screens/wishlist';

const Stack = createStackNavigator();

const ProfileStack = ({ checkAuth }) => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#fff',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        headerTintColor: '#333',
        headerTitle: '',
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: '#f8d7d6' },
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => navigation.navigate('Home', { screen: 'Cart' })}
          >
            <Ionicons name="cart-outline" size={28} color="#333" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen
        name="ProfileScreen"
        children={(props) => <ProfileScreen {...props} checkAuth={checkAuth} />}
        options={{
          headerShown: true,
          headerLeft: () => null, 
        }}
      />
      <Stack.Screen
        name="PurchaseHistory"
        component={PurchaseHistory}
        options={{ headerTitle: 'Purchase History' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={Wishlist}
        options={{ headerTitle: 'Wishlist' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    paddingRight: 15,
  },
});

export default ProfileStack;