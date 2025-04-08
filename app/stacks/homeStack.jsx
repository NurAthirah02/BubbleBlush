import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            <Ionicons name="cart-outline" size={28} color="#333" />
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
});

export default HomeStack;