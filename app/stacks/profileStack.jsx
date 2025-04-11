import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../lib/services/cartContext'; 
import ProfileScreen from '../(tabs)/profile';
import PurchaseHistory from '../screens/purchaseHistory';
import Wishlist from '../screens/wishlist';

const Stack = createStackNavigator();

const ProfileStack = ({ checkAuth }) => {
  // Access cartItems from CartContext
  const { cartItems } = useContext(CartContext);

  // Calculate total quantity of items
  const totalItems = Array.isArray(cartItems) ? cartItems.length : 0;

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
            accessibilityLabel={`Cart with ${totalItems} items`} 
          >
            <View style={styles.cartContainer}>
              <Ionicons name="cart-outline" size={28} color="#333" />
              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              )}
            </View>
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
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#AD1457', 
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfileStack;