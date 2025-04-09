// app/screens/cart.js
import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateCartItemQuantity, removeFromCart } from '../lib/services/cart';
import { CartContext } from '../lib/services/cartContext';
import { useFonts } from 'expo-font';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const Cart = ({ navigation }) => {
  const { cartItems, setCartItems, refreshCart, isLoggedIn } = useContext(CartContext);

  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });

  // Refresh cart when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Cart screen focused, refreshing cart...');
      refreshCart();
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [navigation, refreshCart]);

  const toggleItemSelection = (itemId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const increaseQuantity = async (cartItemId) => {
    try {
      const item = cartItems.find(i => i.cartItemId === cartItemId);
      await updateCartItemQuantity(cartItemId, item.quantity + 1);
      await refreshCart();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const decreaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId);
    if (item.quantity > 1) {
      try {
        await updateCartItemQuantity(cartItemId, item.quantity - 1);
        await refreshCart();
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      await refreshCart();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const total = cartItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const renderRightActions = (cartItemId) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleRemoveItem(cartItemId)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.cartItemId)}
      overshootRight={false}
    >
      <View style={styles.itemContainer}>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleItemSelection(item.product.id)}>
          <Ionicons name={item.selected ? 'checkbox' : 'square-outline'} size={24} color={item.selected ? '#AD1457' : '#666'} />
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.detailsLeft}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <View style={styles.quantityPriceRow}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton} onPress={() => decreaseQuantity(item.cartItemId)}>
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQuantity(item.cartItemId)}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.priceText}>RM {(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCartWrapper}>
      <View style={styles.emptyCartContainer}>
        <Ionicons name="cart-outline" size={100} color="#666" />
        <Text style={styles.emptyCartText}>
          {isLoggedIn ? "Your cart is empty" : "Please login to view your cart"}
        </Text>
        <Text style={styles.emptyCartSubText}>
          {isLoggedIn ? "Add some items from the store to get started!" : ""}
        </Text>
        <TouchableOpacity
          style={styles.shopNowButton}
          onPress={() => navigation.navigate(isLoggedIn ? 'HomeScreen' : 'Login')}
        >
          <Text style={styles.shopNowButtonText}>
            {isLoggedIn ? "Shop Now" : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {cartItems.length > 0 && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>CART</Text>
        </View>
      )}
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.cartItemId}
            contentContainerStyle={styles.listContainer}
          />
          <View style={styles.bottomContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>RM {total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, { opacity: total === 0 ? 0.5 : 1 }]}
              disabled={total === 0}
              onPress={() => navigation.navigate('Checkout', { selectedItems: cartItems.filter(item => item.selected) })}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  titleContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#AD1457',
    letterSpacing: 0.5,
    fontFamily: 'MyFont-Regular',
  },
  emptyCartWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Offset for bottom tab bar
  },
  emptyCartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    fontFamily: 'MyFont-Regular',
  },
  emptyCartSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontFamily: 'MyFont-Regular',
  },
  shopNowButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shopNowButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 220,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  imageContainer: {
    backgroundColor: '#f8d7d6',
    borderRadius: 10,
    padding: 5,
    marginRight: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 10,
    fontFamily: 'MyFont-Regular',
  },
  quantityPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#AD1457',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 15,
  },
  quantityButton: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8EE',
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#AD1457',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '600',
    paddingHorizontal: 8,
    fontFamily: 'MyFont-Regular',
  },
  priceText: {
    fontSize: 16,
    color: '#AD1457',
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
  },
  deleteButton: {
    backgroundColor: '#AD1457',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 'auto',
    borderRadius: 10,
    marginBottom: 15,
    paddingVertical: 15,
    marginLeft: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    paddingBottom: 115,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 18,
    color: '#2D2D2D',
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
  },
  totalAmount: {
    fontSize: 18,
    color: '#AD1457',
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
  },
  checkoutButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
});

export default Cart;