// HomeStack.js
import React, { useContext, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../lib/services/cartContext';
import HomeScreen from '../(tabs)/home';
import ProductDetail from '../screens/productDetail';
import Skincare from '../screens/skincare';
import Haircare from '../screens/haircare';
import Bodycare from '../screens/bodycare';
import Fragrance from '../screens/fragrance';
import Makeup from '../screens/makeup';
import Cart from '../screens/cart';
import Checkout from '../screens/checkout';

const Stack = createStackNavigator();

const HomeStack = () => {
  const { cartItems } = useContext(CartContext);

  // Debug cartItems changes
  useEffect(() => {
    console.log('HomeStack cartItems updated:', cartItems);
  }, [cartItems]);

  // Calculate total quantity of items
  const totalItems = Array.isArray(cartItems) ? cartItems.length : 0;

  console.log('HomeStack rendering, totalItems:', totalItems);

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
            onPress={() => navigation.navigate('Cart')}
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
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="Skincare" component={Skincare} />
      <Stack.Screen name="Makeup" component={Makeup} />
      <Stack.Screen name="Haircare" component={Haircare} />
      <Stack.Screen name="Bodycare" component={Bodycare} />
      <Stack.Screen name="Fragrance" component={Fragrance} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Checkout" component={Checkout} />
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

export default HomeStack;